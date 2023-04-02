import {IRModelObject, IRModelString, IRParameter, MaybeIRModel} from "../../../core/openapi-types-normalized"
import {ImportBuilder} from "../../common/import-builder"
import {Input} from "../../../core/input"
import {getNameFromRef, isRef} from "../../../core/openapi-utils"
import {Reference} from "../../../core/openapi-types"

export abstract class AbstractSchemaBuilder {

  protected constructor(
    public readonly filename: string,
    private readonly input: Input,
    private readonly imports: ImportBuilder,
    private readonly referenced = new Set<string>(),
  ) {
  }

  private add({$ref}: Reference): string {
    this.referenced.add($ref)

    const name = getNameFromRef({$ref}, "s_")

    if (this.imports) {
      this.imports.addSingle(name, this.filename)
    }

    return name
  }

  toString(): string {
    const generate = () => Array.from(this.referenced.values())
      .sort()
      .map(($ref) => this.generateSchemaFromRef($ref))

    // Super lazy way of discovering sub-references for generation easily...
    // could obviously be optimized but in most cases is plenty fast enough.
    let previous = generate()
    let next = generate()

    while (previous.length != next.length) {
      previous = next
      next = generate()
    }

    const imports = new ImportBuilder()
    this.importHelpers(imports)

    return `${imports.toString()}\n${next.join("\n\n")}`
  }

  private generateSchemaFromRef($ref: string): string {
    const name = getNameFromRef({ $ref }, "s_")
    const schemaObject = this.input.schema({ $ref })

    return `
  export const ${ name } = ${ this.fromModel(schemaObject, true) }
  `
  }

  protected abstract importHelpers(importBuilder: ImportBuilder): void

  fromParameters(parameters: IRParameter[]): string {
    const model: IRModelObject = {
      type: "object",
      required: [],
      properties: {},
      allOf: [],
      oneOf: [],
      readOnly: false,
      nullable: false,
      additionalProperties: false,
    }

    parameters.forEach(parameter => {
      if (parameter.required) {
        model.required.push(parameter.name)
      }
      model.properties[parameter.name] = parameter.schema
    })

    return this.fromModel(model, true)
  }

  fromModel(maybeModel: MaybeIRModel, required: boolean): string {

    if (isRef(maybeModel)) {
      return this.add(maybeModel)
    }

    const model = this.input.schema(maybeModel)

    switch (model.type) {
      case "string":
        return this.string(model, required)
      case "number":
        return this.number(required)
      case "boolean":
        return this.boolean(required)
      case "array":
        return this.array([
          this.fromModel(this.input.schema(model.items), true),
        ], required)
      case "object":

        if (model.allOf.length) {
          return this.intersect(model.allOf.map(it => this.fromModel(it, true)))
        }

        if (model.oneOf.length) {
          return this.union(model.oneOf.map(it => this.fromModel(it, true)))
        }

        return this.object(
          Object.fromEntries(
            Object.entries(model.properties)
              .map(([key, value]) => {
                return [key, this.fromModel(this.input.schema(value), model.required.includes(key))]
              }),
          ), required,
        )
    }
  }

  public abstract any(): string

  public abstract void(): string

  protected abstract intersect(schemas: string[]): string

  protected abstract union(schemas: string[]): string

  protected abstract object(keys: Record<string, string>, required: boolean): string

  protected abstract array(items: string[], required: boolean): string

  protected abstract number(required: boolean): string

  protected abstract string(model: IRModelString, required: boolean): string

  protected abstract boolean(required: boolean): string
}
