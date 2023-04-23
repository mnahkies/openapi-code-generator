import {Input} from "../../../core/input"
import {
  IRModelString
} from "../../../core/openapi-types-normalized"
import {isDefined} from "../../../core/utils"
import {AbstractSchemaBuilder} from "./abstract-schema-builder"
import {ImportBuilder} from "../import-builder"
import {Reference} from "../../../core/openapi-types"
import {getSchemaNameFromRef, getTypeNameFromRef} from "../../../core/openapi-utils"

// todo: coerce is cool for input where everything starts as strings,
//       but for output we probably don't want that as its more likely
//       to mask mistakes. https://en.wikipedia.org/wiki/Robustness_principle
export class ZodBuilder extends AbstractSchemaBuilder {
  constructor(
    private readonly zod = "z",
    filename: string,
    input: Input,
    imports: ImportBuilder
  ) {
    super(filename, input, imports)

    this.importHelpers(imports)

    imports.from("@nahkies/typescript-koa-runtime/zod")
      .add("parseRequestInput", "Params", "responseValidationFactory")
  }

  protected importHelpers(imports: ImportBuilder) {
    imports.from("zod")
      .add(this.zod)
  }

  protected schemaFromRef(reference: Reference, imports: ImportBuilder): {name: string, type: string, value: string} {
    const name = getSchemaNameFromRef(reference)
    const schemaObject = this.input.schema(reference)

    const value = this.fromModel(schemaObject, true)

    let type = ""

    // todo: bit hacky, but it will work for now.
    if (value.includes("z.lazy(")) {
      type = getTypeNameFromRef(reference)
      imports.addSingle(type, "./models")
    }

    return {
      name,
      type: type ? `${this.zod}.ZodType<${type}>` : "",
      value
    }
  }

  protected intersect(schemas: string[]): string {
    return schemas.filter(isDefined).reduce((acc, it) => {
      return `${acc}\n.merge(${it})`
    })
  }

  protected lazy(schema: string): string {
    return [this.zod, `lazy(() => ${schema})`].join(".")
  }

  protected union(schemas: string[]): string {

    const definedSchemas = schemas.filter(isDefined)

    if (definedSchemas.length === 1) {
      return definedSchemas[0]
    }

    return [
      this.zod,
      `union([\n${
        definedSchemas.map(it => it + ",").join("\n")
      }\n])`
    ].filter(isDefined).join(".")
  }

  protected nullable(schema: string): string {
    return [
      schema,
      "nullable()"
    ].filter(isDefined).join(".")
  }

  protected object(keys: Record<string, string>, required: boolean): string {
    return [
      this.zod,
      `object({${Object.entries(keys).map(([key, value]) => `"${key}": ${value}`).join(",")}})`,
      required ? undefined : "optional()"
    ].filter(isDefined).join(".")
  }

  protected array(items: string[], required: boolean): string {
    return [
      this.zod,
      `array(${items.join(",")})`,
      required ? undefined : "optional()"
    ].filter(isDefined).join(".")
  }

  protected number(required: boolean) {
    return [
      this.zod,
      "coerce.number()",
      required ? undefined : "optional()"
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
      required ? undefined : "optional()"
    ].filter(isDefined).join(".")
  }

  protected enum(model: IRModelString, required: boolean) {
    if (!model.enum) {
      throw new Error("model is not an enum")
    }

    return [
      this.zod,
      `enum([${model.enum.map(it => `"${it}"`).join(",")}])`,
      required ? undefined : "optional()"
    ].filter(isDefined).join(".")
  }

  protected boolean(required: boolean) {
    return [
      this.zod,
      // todo: this would mean the literal string "false" as a query parameter is coerced to true
      "coerce.boolean()",
      required ? undefined : "optional()"
    ].filter(isDefined).join(".")
  }

  public any(): string {
    return [
      this.zod,
      "any()"
    ].filter(isDefined).join(".")
  }

  public void(): string {
    return [
      this.zod,
      "void()"
    ].filter(isDefined).join(".")
  }

}
