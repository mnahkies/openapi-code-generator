import {IRModelObject, IRModelString, IRParameter, MaybeIRModel} from "../../../core/openapi-types-normalized"
import {ImportBuilder} from "../../common/import-builder"
import {Input} from "../../../core/input"

export abstract class SchemaBuilder {

  protected constructor(private readonly input: Input) {
  }


  abstract importHelpers(importBuilder: ImportBuilder): void

  fromParameters(parameters: IRParameter[]): string {
    const model: IRModelObject = {
      type: "object",
      required: [],
      properties: {},
      allOf: [],
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
          this.fromModel(this.input.schema(model.items), false),
        ], required)
      case "object":
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

  protected abstract object(keys: Record<string, string>, required: boolean): string

  protected abstract array(items: string[], required: boolean): string

  protected abstract number(required: boolean): string

  protected abstract string(model: IRModelString, required: boolean): string

  protected abstract boolean(required: boolean): string
}
