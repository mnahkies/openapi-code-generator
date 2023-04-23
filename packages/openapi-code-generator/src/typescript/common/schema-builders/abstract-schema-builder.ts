/**
 * @prettier
 */

import {
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

      if (this.graph.circular.has(name) && !isAnonymous) {
        return this.lazy(name)
      } else {
        return name
      }
    }

    const model = this.input.schema(maybeModel)

    let result: string

    switch (model.type) {
      case "string":
        result = this.string(model, required)
        break
      case "number":
        result = this.number(required)
        break
      case "boolean":
        result = this.boolean(required)
        break
      case "array":
        result = this.array([this.fromModel(model.items, true)], required)
        break
      case "object":
        // todo: additionalProperties support
        if (model.allOf.length) {
          result = this.intersect(
            model.allOf.map((it) => this.fromModel(it, true)),
          )
        } else if (model.oneOf.length) {
          result = this.union(model.oneOf.map((it) => this.fromModel(it, true)))
        } else if (model.anyOf.length) {
          result = this.union(model.anyOf.map((it) => this.fromModel(it, true)))
        } else {
          result = this.object(
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
        }
        break
    }

    if (model.nullable) {
      return this.nullable(result)
    }

    return result
  }

  public abstract any(): string

  public abstract void(): string

  protected abstract lazy(schema: string): string

  protected abstract intersect(schemas: string[]): string

  protected abstract union(schemas: string[]): string

  protected abstract nullable(schema: string): string

  protected abstract object(
    keys: Record<string, string>,
    required: boolean,
  ): string

  protected abstract array(items: string[], required: boolean): string

  protected abstract number(required: boolean): string

  protected abstract string(model: IRModelString, required: boolean): string

  protected abstract boolean(required: boolean): string
}
