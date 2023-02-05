import { Input } from "../../../core/input"
import { IRModelObject, IRParameter, MaybeIRModel } from "../../../core/openapi-types-normalized"
import { isDefined } from "../../../core/utils"
import { SchemaBuilder } from "./schema-builder"

export class ZodBuilder implements SchemaBuilder {
  constructor(
    private readonly zod = 'z',
    private readonly input: Input,
  ) {
  }

  staticHelpers(): string {
    return `
function paramValidationFactory<Type>(schema: ZodSchema): Middleware<{ params: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.safeParse(ctx.params)
    console.info(result)

    if (!result.success) {
      throw new Error("validation error")
    }

    ctx.state.params = result.data

    return next()
  }
}

function queryValidationFactory<Type>(schema: ZodSchema): Middleware<{ query: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.safeParse(ctx.query)
    console.info(result)

    if (!result.success) {
      throw new Error("validation error")
    }

    ctx.state.query = result.data

    return next()
  }
}

function bodyValidationFactory<Type>(schema: ZodSchema): Middleware<{ body: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.safeParse(ctx.request.body)
    console.info(result)

    if (!result.success) {
      throw new Error("validation error")
    }

    ctx.state.body = result.data

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
      this.zod,
      `object({${ Object.entries(keys).map(([key, value]) => `"${ key }": ${ value }`).join(',') }})`,
      required ? undefined : 'optional()',
    ].filter(isDefined).join('.')
  }

  private array(items: string[], required: boolean): string {
    return [
      this.zod,
      `array(${ items.join(',') })`,
      required ? undefined : 'optional()',
    ].filter(isDefined).join('.')
  }

  private number(required: boolean) {
    return [
      this.zod,
      "coerce.number()",
      required ? undefined : 'optional()',
    ].filter(isDefined).join('.')
  }

  private string(required: boolean) {
    return [
      this.zod,
      "coerce.string()",
      required ? undefined : 'optional()',
    ].filter(isDefined).join('.')
  }

  private boolean(required: boolean) {
    return [
      this.zod,
      // TODO: this would mean the literal string "false" as a query parameter is coerced to true
      "coerce.boolean()",
      required ? undefined : 'optional()',
    ].filter(isDefined).join('.')
  }

}
