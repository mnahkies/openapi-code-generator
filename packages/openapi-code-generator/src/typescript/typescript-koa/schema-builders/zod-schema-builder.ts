import {Input} from "../../../core/input"
import {
  IRModelString,
} from "../../../core/openapi-types-normalized"
import {isDefined} from "../../../core/utils"
import {SchemaBuilder} from "./schema-builder"
import {ImportBuilder} from "../../common/import-builder"

export class ZodBuilder extends SchemaBuilder {
  constructor(
    private readonly zod = "z",
    input: Input,
  ) {
    super(input)
  }

  importHelpers(importBuilder: ImportBuilder) {
    importBuilder.from("@nahkies/typescript-koa-runtime/zod")
      .add("queryValidationFactory", "paramValidationFactory", "bodyValidationFactory")
  }

  protected union(maybeModels: string[]): string {
    return [
      this.zod,
      `union([\n${
        maybeModels.map(it => it + ",").join("\n")
      }\n])`
    ].filter(isDefined).join(".")
  }

  protected object(keys: Record<string, string>, required: boolean): string {
    return [
      this.zod,
      `object({${Object.entries(keys).map(([key, value]) => `"${key}": ${value}`).join(",")}})`,
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

  protected array(items: string[], required: boolean): string {
    return [
      this.zod,
      `array(${items.join(",")})`,
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

  protected number(required: boolean) {
    return [
      this.zod,
      "coerce.number()",
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

  protected string(model: IRModelString, required: boolean) {
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

  protected enum(model: IRModelString, required: boolean) {
    if (!model.enum) {
      throw new Error("model is not an enum")
    }

    return [
      this.zod,
      `enum([${model.enum.map(it => `"${it}"`).join(",")}])`,
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

  protected boolean(required: boolean) {
    return [
      this.zod,
      // TODO: this would mean the literal string "false" as a query parameter is coerced to true
      "coerce.boolean()",
      required ? undefined : "optional()",
    ].filter(isDefined).join(".")
  }

}
