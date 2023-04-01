import { Input } from "../../../core/input"
import {
  IRModelObject,
  IRModelString,
  IRParameter,
  MaybeIRModel,
} from "../../../core/openapi-types-normalized"
import { isDefined } from "../../../core/utils"
import { SchemaBuilder } from "./schema-builder"
import { ImportBuilder } from "../../common/import-builder"

export class ZodBuilder implements SchemaBuilder {
  constructor(
    private readonly zod = "z",
    private readonly input: Input,
  ) {
  }

  importHelpers(importBuilder: ImportBuilder) {
    importBuilder.from("@nahkies/typescript-koa-runtime/zod")
      .add("queryValidationFactory", "paramValidationFactory", "bodyValidationFactory")
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

  private object(keys: Record<string, string>, required: boolean): string {
    return [
      this.zod,
      `object({${ Object.entries(keys).map(([key, value]) => `"${ key }": ${ value }`).join(",") }})`,
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

  private array(items: string[], required: boolean): string {
    return [
      this.zod,
      `array(${ items.join(",") })`,
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

  private number(required: boolean) {
    return [
      this.zod,
      "coerce.number()",
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

  private string(model: IRModelString, required: boolean) {
    if (model.enum) {
      return this.enum(model, required)
    }

    return [
      this.zod,
      "coerce.string()",
      model.format === "date-time" ? "datetime({offset:true})" : undefined,
      model.format === "email" ? "email()" : undefined,
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

  private enum(model: IRModelString, required: boolean) {
    if (!model.enum) {
      throw new Error("model is not an enum")
    }

    return [
      this.zod,
      `enum([${ model.enum.map(it => `"${ it }"`).join(",") }])`,
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

  private boolean(required: boolean) {
    return [
      this.zod,
      // TODO: this would mean the literal string "false" as a query parameter is coerced to true
      "coerce.boolean()",
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

}
