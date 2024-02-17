/**
 * @prettier
 */

import {
  IRModelNumeric,
  IRModelObject,
  IRModelString,
  IRParameter,
  MaybeIRModel,
} from "../../../core/openapi-types-normalized"
import {ImportBuilder} from "../import-builder"
import {Input} from "../../../core/input"
import {getSchemaNameFromRef, isRef} from "../../../core/openapi-utils"
import {Reference} from "../../../core/openapi-types"
import {buildDependencyGraph} from "../../../core/dependency-graph"
import {logger} from "../../../core/logger"
import {buildExport, ExportDefinition} from "../typescript-common"

export abstract class AbstractSchemaBuilder {
  private readonly graph

  protected constructor(
    public readonly filename: string,
    protected readonly input: Input,
    private readonly imports: ImportBuilder,
    private readonly referenced: Record<string, Reference> = {},
  ) {
    this.graph = buildDependencyGraph(this.input, getSchemaNameFromRef)
  }

  private add(reference: Reference): string {
    const name = getSchemaNameFromRef(reference)
    this.referenced[name] = reference

    if (this.imports) {
      this.imports.addSingle(name, this.filename)
    }

    return name
  }

  toString(): string {
    logger.time(`generate ${this.filename}`)

    const imports = new ImportBuilder()

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
              this.schemaFromRef(this.referenced[name], imports),
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

    this.importHelpers(imports)

    return `${imports.toString()}\n\n${next.join("\n\n")}`
  }

  protected abstract importHelpers(importBuilder: ImportBuilder): void

  protected abstract schemaFromRef(
    reference: Reference,
    imports: ImportBuilder,
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
  ): string {
    if (isRef(maybeModel)) {
      const name = this.add(maybeModel)

      const result = required ? this.required(name) : this.optional(name)

      if (this.graph.circular.has(name) && !isAnonymous) {
        return this.lazy(result)
      } else {
        return result
      }
    }

    const model = this.input.schema(maybeModel)

    let result: string

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
      case "object":
        if (model.allOf.length) {
          const isMergable = model.allOf
            .map((it) => this.input.schema(it))
            .every((it) => it.type === "object" && !it.additionalProperties)

          const schemas = model.allOf.map((it) => this.fromModel(it, true))

          result = isMergable ? this.merge(schemas) : this.intersect(schemas)
        } else if (model.oneOf.length) {
          result = this.union(model.oneOf.map((it) => this.fromModel(it, true)))
        } else if (model.anyOf.length) {
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

    if (model.nullable) {
      result = this.nullable(result)
    }

    result = required ? this.required(result) : this.optional(result)

    return result
  }

  public abstract parse(schema: string, value: string): string

  public abstract any(): string

  public abstract void(): string

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

  protected abstract array(items: string[]): string

  protected abstract record(schema: string): string

  protected abstract number(model: IRModelNumeric): string

  protected abstract string(model: IRModelString): string

  protected abstract boolean(): string
}
