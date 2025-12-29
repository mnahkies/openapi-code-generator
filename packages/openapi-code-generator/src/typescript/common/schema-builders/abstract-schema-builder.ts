import {
  buildDependencyGraph,
  type DependencyGraph,
} from "../../../core/dependency-graph"
import type {Input} from "../../../core/input"
import {logger} from "../../../core/logger"
import type {Reference} from "../../../core/openapi-types"
import type {
  IRModelArray,
  IRModelBase,
  IRModelBoolean,
  IRModelNumeric,
  IRModelRecord,
  IRModelString,
  MaybeIRModel,
} from "../../../core/openapi-types-normalized"
import {getNameFromRef, isRef} from "../../../core/openapi-utils"
import {CompilationUnit, type ICompilable} from "../compilation-units"
import type {ImportBuilder} from "../import-builder"
import type {TypeBuilder} from "../type-builder"
import {buildExport, type ExportDefinition} from "../typescript-common"
import type {SchemaBuilderType} from "./schema-builder"

export type SchemaBuilderConfig = {
  allowAny: boolean
}

export abstract class AbstractSchemaBuilder<
  SubClass extends AbstractSchemaBuilder<SubClass, StaticSchemas>,
  StaticSchemas extends {[key: string]: string},
> implements ICompilable
{
  public abstract readonly type: SchemaBuilderType

  private readonly graph: DependencyGraph

  protected readonly typeBuilder: TypeBuilder

  protected constructor(
    public readonly filename: string,
    protected readonly input: Input,
    protected readonly config: SchemaBuilderConfig,
    protected readonly schemaBuilderImports: ImportBuilder,
    typeBuilder: TypeBuilder,
    private readonly availableStaticSchemas: StaticSchemas,
    private readonly referenced: Record<string, Reference> = {},
    private readonly referencedStaticSchemas = new Set<keyof StaticSchemas>(),
    private readonly imports?: ImportBuilder,
    private readonly parent?: SubClass,
  ) {
    this.graph =
      parent?.graph ??
      buildDependencyGraph(this.input, (it) => this.getSchemaNameFromRef(it))
    this.importHelpers(this.schemaBuilderImports)
    this.typeBuilder = typeBuilder.withImports(this.schemaBuilderImports)
  }

  abstract withImports(imports: ImportBuilder): SubClass

  private add(reference: Reference): string {
    this.parent?.add(reference)

    const name = this.getSchemaNameFromRef(reference)
    this.referenced[name] = reference

    if (this.imports) {
      this.imports.addSingle(name, this.filename, false)
    }

    return name
  }

  protected addStaticSchema(name: keyof StaticSchemas): string {
    if (typeof name !== "string") {
      throw new Error("static schemas must be strings")
    }

    this.parent?.addStaticSchema(name)
    this.referencedStaticSchemas.add(name)
    this.imports?.addSingle(name, this.filename, false)

    return name
  }

  private staticSchemas(): string[] {
    return Array.from(this.referencedStaticSchemas.values()).sort() as string[]
  }

  toString(): string {
    logger.time(`generate ${this.filename}`)

    const generate = () => {
      const seen = new Set()

      return (
        this.staticSchemas()
          .concat(this.graph.order.filter((it) => this.referenced[it]))
          // todo: this is needed because the dependency graph only considers schemas from the entrypoint
          //       specification - ideally we'd recurse into all referenced specifications and include their
          //       schemas in the ordering
          .concat(Object.keys(this.referenced))
          .filter((it) => {
            const alreadySeen = seen.has(it)
            seen.add(it)
            return !alreadySeen
          })
          .map((name) => {
            const $ref = this.referenced[name]
            if ($ref) {
              return buildExport(this.schemaFromRef($ref))
            }

            const staticSchemaName = this.referencedStaticSchemas.has(name)
              ? (name as keyof StaticSchemas & string)
              : undefined
            const staticSchemaValue =
              staticSchemaName && this.availableStaticSchemas[staticSchemaName]
            if (staticSchemaName && staticSchemaValue) {
              return buildExport({
                name: staticSchemaName,
                kind: "const",
                value: staticSchemaValue,
              })
            }

            throw new Error("unreachable")
          })
      )
    }

    // Super lazy way of discovering sub-references for generation easily...
    // could obviously be optimized but in most cases is plenty fast enough.
    let previous = generate()
    let next = generate()

    while (previous.length !== next.length) {
      previous = next
      next = generate()
    }

    if (next.length === 0) {
      return ""
    }

    return `${this.preamble()}${next.join("\n\n")}`
  }

  protected abstract importHelpers(importBuilder: ImportBuilder): void

  public preamble(): string {
    return ``
  }

  public getSchemaNameFromRef(reference: Reference) {
    return getNameFromRef(reference, "s_")
  }

  public abstract schemaTypeForType(type: string): string

  protected abstract schemaFromRef(reference: Reference): ExportDefinition

  // todo: rethink the isAnonymous parameter - it would be better to just provide more context
  fromModel(
    maybeModel: MaybeIRModel,
    required: boolean,
    isAnonymous = false,
    nullable = false,
  ): string {
    // if we generate an inline/anonymous schema then we'll need to import
    // the schema library.
    if (isAnonymous && this.imports) {
      this.importHelpers(this.imports)
      this.imports.from(this.filename).add("joiIntersect")
    }

    let result: string

    if (isRef(maybeModel)) {
      const name = this.add(maybeModel)
      result = name

      if (nullable) {
        result = this.nullable(result)
      }

      if (maybeModel["x-internal-preprocess"]) {
        const dereferenced = this.input.preprocess(
          maybeModel["x-internal-preprocess"],
        )
        if (dereferenced.deserialize) {
          result = this.preprocess(result, dereferenced.deserialize.fn)
        }
      }

      result = required ? this.required(result, false) : this.optional(result)

      if (this.graph.circular.has(name) && !isAnonymous) {
        return this.lazy(result)
      }
      return result
    }

    if (!Reflect.get(maybeModel, "isIRModel")) {
      throw new Error("passed raw schema")
    }

    const model = maybeModel

    switch (model.type) {
      case "string": {
        // todo: byte is base64 encoded string, https://spec.openapis.org/registry/format/byte.html
        // model.format === "byte"
        if (model.format === "binary") {
          result = this.any()
        } else {
          result = this.string(model)
        }

        break
      }
      case "number":
        result = this.number(model)
        break
      case "boolean":
        result = this.boolean(model)
        break
      case "array":
        result = this.array(model, [this.arrayItems(model.items)])
        break
      case "intersection": {
        // todo: do we need to special case a single schema?
        const schemas = model.schemas.map((it) => this.fromModel(it, true))

        // Note: for zod in particular it's desirable to use merge over intersection
        //       where possible, as it returns a more malleable schema
        const isMergable = model.schemas
          .map((it) => this.input.schema(it))
          .every((it) => it.type === "object" && !it.additionalProperties)

        result = isMergable ? this.merge(schemas) : this.intersect(schemas)

        break
      }

      case "union": {
        // todo: do we need to special case a single schema?
        result = this.union(model.schemas.map((it) => this.fromModel(it, true)))
        break
      }

      case "object": {
        const properties =
          Object.keys(model.properties).length &&
          this.object(
            Object.fromEntries(
              Object.entries(model.properties).map(([key, value]) => {
                return [
                  key,
                  this.fromModel(value, model.required.includes(key)),
                ]
              }),
            ),
            required,
          )

        const additionalProperties =
          model.additionalProperties &&
          this.fromModel(model.additionalProperties, true)

        if (properties && additionalProperties) {
          result = this.intersect([properties, additionalProperties])
        } else if (properties) {
          result = properties
        } else if (additionalProperties) {
          result = additionalProperties
        } else {
          result = this.object({}, required)
        }
        break
      }
      case "any": {
        result = this.config.allowAny ? this.any() : this.unknown()
        break
      }

      case "never": {
        result = this.never()
        break
      }

      case "null": {
        throw new Error("unreachable - input should normalize this out")
      }

      case "record": {
        result = this.record(model)
        break
      }

      default: {
        throw new Error(
          `unsupported type '${JSON.stringify(model satisfies never, undefined, 2)}'`,
        )
      }
    }

    if (model["x-internal-preprocess"]) {
      const dereferenced = this.input.preprocess(model["x-internal-preprocess"])
      if (dereferenced.deserialize) {
        result = this.preprocess(result, dereferenced.deserialize.fn)
      }
    }

    if (nullable || model.nullable) {
      result = this.nullable(result)
    }

    const hasDefaultValue = model.default !== undefined

    result = required
      ? this.required(result, hasDefaultValue)
      : this.optional(result)

    if (hasDefaultValue) {
      result = this.default(result, model)
    }

    return result
  }

  public abstract parse(schema: string, value: string): string

  protected abstract lazy(schema: string): string

  /**
   * Equivalent to `type z = x & y` but only works on non-record object schemas
   * @param schemas
   * @protected
   */
  protected abstract merge(schemas: string[]): string

  /**
   * Equivalent to `type z = x & y`, works on any schemas
   * @param schemas
   * @protected
   */
  protected abstract intersect(schemas: string[]): string

  protected abstract union(schemas: string[]): string

  protected abstract preprocess(
    schema: string,
    transformation: string | ((it: unknown) => unknown),
  ): string

  protected abstract nullable(schema: string): string

  protected abstract optional(schema: string): string

  protected abstract required(schema: string, hasDefaultValue: boolean): string

  protected abstract object(
    keys: Record<string, string>,
    required: boolean,
  ): string

  protected abstract record(model: IRModelRecord): string

  protected abstract array(model: IRModelArray, items: string[]): string

  protected abstract arrayItems(model: MaybeIRModel): string

  protected abstract number(model: IRModelNumeric): string

  protected abstract string(model: IRModelString): string

  protected abstract boolean(mode: IRModelBoolean): string

  public abstract any(): string

  protected abstract unknown(): string

  protected abstract default(schema: string, model: IRModelBase): string

  public abstract void(): string

  public abstract never(): string

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(
      this.filename,
      this.schemaBuilderImports,
      this.toString(),
    )
  }
}
