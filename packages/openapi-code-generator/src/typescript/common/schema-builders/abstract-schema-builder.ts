import {buildDependencyGraph} from "../../../core/dependency-graph"
import {Input} from "../../../core/input"
import {logger} from "../../../core/logger"
import {Reference} from "../../../core/openapi-types"
import {
  IRModelNumeric,
  IRModelObject,
  IRModelString,
  IRParameter,
  MaybeIRModel,
} from "../../../core/openapi-types-normalized"
import {getSchemaNameFromRef, isRef} from "../../../core/openapi-utils"
import {hasSingleElement} from "../../../core/utils"
import {CompilationUnit, ICompilable} from "../compilation-units"
import {ImportBuilder} from "../import-builder"
import {ExportDefinition, buildExport} from "../typescript-common"

export abstract class AbstractSchemaBuilder<
  SubClass extends AbstractSchemaBuilder<SubClass>,
> implements ICompilable
{
  private readonly graph

  private readonly schemaBuilderImports = new ImportBuilder()

  protected constructor(
    public readonly filename: string,
    protected readonly input: Input,
    private readonly referenced: Record<string, Reference> = {},
    private readonly imports?: ImportBuilder,
    private readonly parent?: SubClass,
  ) {
    this.graph = buildDependencyGraph(this.input, getSchemaNameFromRef)
    this.importHelpers(this.schemaBuilderImports)
  }

  abstract withImports(imports: ImportBuilder): SubClass

  private add(reference: Reference): string {
    this.parent?.add(reference)

    const name = getSchemaNameFromRef(reference)
    this.referenced[name] = reference

    if (this.imports) {
      this.imports.addSingle(name, this.filename)
    }

    return name
  }

  toString(): string {
    logger.time(`generate ${this.filename}`)

    const generate = () => {
      const seen = new Set()

      return (
        this.graph.order
          .filter((it) => this.referenced[it])
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
            return buildExport(
              this.schemaFromRef(
                this.referenced[name]!,
                this.schemaBuilderImports,
              ),
            )
          })
      )
    }

    // Super lazy way of discovering sub-references for generation easily...
    // could obviously be optimized but in most cases is plenty fast enough.
    let previous = generate()
    let next = generate()

    while (previous.length != next.length) {
      previous = next
      next = generate()
    }

    if (next.length === 0) {
      return ""
    }

    return `${next.join("\n\n")}`
  }

  protected abstract importHelpers(importBuilder: ImportBuilder): void

  protected abstract schemaFromRef(
    reference: Reference,
    schemaBuilderImports: ImportBuilder,
  ): ExportDefinition

  fromParameters(parameters: IRParameter[]): string {
    const model: IRModelObject = {
      type: "object",
      required: [],
      properties: {},
      allOf: [],
      oneOf: [],
      anyOf: [],
      readOnly: false,
      nullable: false,
      additionalProperties: false,
    }

    parameters.forEach((parameter) => {
      if (parameter.required) {
        model.required.push(parameter.name)
      }
      model.properties[parameter.name] = parameter.schema
    })

    return this.fromModel(model, true, true)
  }

  // todo: rethink the isAnonymous parameter - it would be better to just provide more context
  fromModel(
    maybeModel: MaybeIRModel,
    required: boolean,
    isAnonymous = false,
    nullable: boolean = false,
  ): string {
    // if we generate an inline/anonymous schema then we'll need to import
    // the schema library.
    if (isAnonymous && this.imports) {
      this.importHelpers(this.imports)
    }

    let result: string

    if (isRef(maybeModel)) {
      const name = this.add(maybeModel)
      result = name

      if (nullable) {
        result = this.nullable(result)
      }

      result = required ? this.required(result) : this.optional(result)

      if (this.graph.circular.has(name) && !isAnonymous) {
        return this.lazy(result)
      } else {
        return result
      }
    }

    const model = this.input.schema(maybeModel)

    switch (model.type) {
      case "string":
        result = this.string(model)
        break
      case "number":
        result = this.number(model)
        break
      case "boolean":
        result = this.boolean()
        break
      case "array":
        result = this.array([this.fromModel(model.items, true)])
        break
      case "object": {
        if (model.allOf.length) {
          if (hasSingleElement(model.allOf)) {
            return this.fromModel(
              model.allOf[0],
              required,
              isAnonymous,
              model.nullable,
            )
          }

          const isMergable = model.allOf
            .map((it) => this.input.schema(it))
            .every((it) => it.type === "object" && !it.additionalProperties)

          const schemas = model.allOf.map((it) => this.fromModel(it, true))

          result = isMergable ? this.merge(schemas) : this.intersect(schemas)
        } else if (model.oneOf.length) {
          if (hasSingleElement(model.oneOf)) {
            return this.fromModel(
              model.oneOf[0],
              required,
              isAnonymous,
              model.nullable,
            )
          }

          result = this.union(model.oneOf.map((it) => this.fromModel(it, true)))
        } else if (model.anyOf.length) {
          if (hasSingleElement(model.anyOf)) {
            return this.fromModel(
              model.anyOf[0],
              required,
              isAnonymous,
              model.nullable,
            )
          }

          result = this.union(model.anyOf.map((it) => this.fromModel(it, true)))
        } else {
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
            this.record(
              typeof model.additionalProperties === "boolean"
                ? this.any()
                : this.fromModel(model.additionalProperties, true),
            )

          if (properties && additionalProperties) {
            result = this.intersect([properties, additionalProperties])
          } else if (properties) {
            result = properties
          } else if (additionalProperties) {
            result = additionalProperties
          } else {
            result = this.object({}, required)
          }
        }
        break
      }
    }

    if (nullable || model.nullable) {
      result = this.nullable(result)
    }

    result = required ? this.required(result) : this.optional(result)

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

  protected abstract nullable(schema: string): string

  protected abstract optional(schema: string): string

  protected abstract required(schema: string): string

  protected abstract object(
    keys: Record<string, string>,
    required: boolean,
  ): string

  protected abstract record(schema: string): string

  protected abstract array(items: string[]): string

  protected abstract number(model: IRModelNumeric): string

  protected abstract string(model: IRModelString): string

  protected abstract boolean(): string

  public abstract any(): string

  public abstract void(): string

  toCompilationUnit(): CompilationUnit {
    return {
      filename: this.filename,
      imports: this.schemaBuilderImports,
      code: this.toString(),
    }
  }
}
