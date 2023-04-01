import { Input } from "../../../core/input"
import { IRModelObject, IRParameter, MaybeIRModel } from "../../../core/openapi-types-normalized"
import { isDefined } from "../../../core/utils"
import { SchemaBuilder } from "./schema-builder"

enum JoiFn {
  Object = "object()",
  Array = "array()",
  Number = "number()",
  String = "string()",
  Boolean = "boolean()",
  Required = "required()"
}

export class JoiBuilder implements SchemaBuilder {
  constructor(
    private readonly joi = "joi",
    private readonly input: Input,
  ) {
  }

  staticHelpers(): string {
    return `
function paramValidationFactory<Type>(schema: joi.Schema): Middleware<{ params: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.params, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.state.params = result.value

    return next()
  }
}

function queryValidationFactory<Type>(schema: joi.Schema): Middleware<{ query: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.query, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.state.query = result.value

    return next()
  }
}

function bodyValidationFactory<Type>(schema: joi.Schema): Middleware<{ body: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.request.body, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.state.body = result.value

    return next()
  }
}
`
  }

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
        return this.string(required)
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

  private object(keys: Record<string, string>, required: boolean): string {
    return [
      this.joi,
      JoiFn.Object,
      `keys({${ Object.entries(keys).map(([key, value]) => `"${ key }": ${ value }`).join(",") } })`,
      required ? JoiFn.Required : undefined,
    ].filter(isDefined).join(".")
  }

  private array(items: string[], required: boolean): string {
    return [
      this.joi,
      JoiFn.Array,
      `items(${ items.join(",") })`,
      required ? JoiFn.Required : undefined,
    ].filter(isDefined).join(".")
  }

  private number(required: boolean) {
    return [
      this.joi,
      JoiFn.Number,
      required ? JoiFn.Required : undefined,
    ].filter(isDefined).join(".")
  }

  private string(required: boolean) {
    return [
      this.joi,
      JoiFn.String,
      required ? JoiFn.Required : undefined,
    ].filter(isDefined).join(".")
  }

  private boolean(required: boolean) {
    return [
      this.joi,
      JoiFn.Boolean,
      required ? JoiFn.Required : undefined,
    ].filter(isDefined).join(".")
  }

}
