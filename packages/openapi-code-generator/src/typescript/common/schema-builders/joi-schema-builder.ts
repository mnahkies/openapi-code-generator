import {Input} from "../../../core/input"
import {Reference} from "../../../core/openapi-types"
import {
  IRModelNumeric,
  IRModelString,
} from "../../../core/openapi-types-normalized"
import {getSchemaNameFromRef} from "../../../core/openapi-utils"
import {hasSingleElement, isDefined} from "../../../core/utils"
import {ImportBuilder} from "../import-builder"
import {quotedStringLiteral} from "../type-utils"
import {ExportDefinition} from "../typescript-common"
import {AbstractSchemaBuilder} from "./abstract-schema-builder"

export class JoiBuilder extends AbstractSchemaBuilder<JoiBuilder> {
  private readonly joi = "joi"

  static async fromInput(filename: string, input: Input): Promise<JoiBuilder> {
    return new JoiBuilder(filename, input)
  }

  override withImports(imports: ImportBuilder): JoiBuilder {
    return new JoiBuilder(this.filename, this.input, {}, imports, this)
  }

  protected importHelpers(imports: ImportBuilder) {
    imports.addModule(this.joi, "@hapi/joi")
  }

  public parse(schema: string, value: string): string {
    return `await ${schema}.validateAsync(${value})`
  }

  protected schemaFromRef(reference: Reference): ExportDefinition {
    const name = getSchemaNameFromRef(reference)
    const schemaObject = this.input.schema(reference)

    const value = this.fromModel(schemaObject, true)

    return {
      name,
      type: "",
      value: value + `.id("${name}")`,
      kind: "const",
    }
  }

  protected lazy(schema: string): string {
    return [this.joi, `link('#${schema}')`].join(".")
  }

  protected merge(schemas: string[]): string {
    const definedSchemas = schemas.filter(isDefined)

    if (hasSingleElement(definedSchemas)) {
      return definedSchemas[0]
    }

    return this.intersect(definedSchemas)
  }

  protected intersect(schemas: string[]): string {
    const definedSchemas = schemas.filter(isDefined)

    if (hasSingleElement(definedSchemas)) {
      return definedSchemas[0]
    }

    return definedSchemas.reduce((acc, it) => {
      return `${acc}\n.concat(${it})`
    })
  }

  protected union(schemas: string[]): string {
    const definedSchemas = schemas.filter(isDefined)

    if (hasSingleElement(definedSchemas)) {
      return definedSchemas[0]
    }

    return [
      this.joi,
      `alternatives().try(${definedSchemas.map((it) => it).join(",")})`,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected nullable(schema: string): string {
    return [schema, "allow(null)"].join(".")
  }

  protected optional(schema: string): string {
    return schema
  }

  protected required(schema: string): string {
    // HACK: avoid `joi.string().allow(null).required().required()`
    if (schema.split(".").pop() === "required()") {
      return schema
    }

    return [schema, "required()"].join(".")
  }

  protected object(keys: Record<string, string>): string {
    return [
      this.joi,
      "object()",
      `keys({${Object.entries(keys)
        .map(([key, value]) => `"${key}": ${value}`)
        .join(",")} })`,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected record(schema: string): string {
    return [this.joi, "object()", `pattern(${this.any()}, ${schema})`]
      .filter(isDefined)
      .join(".")
  }

  protected array(items: string[]): string {
    return [this.joi, "array()", `items(${items.join(",")})`]
      .filter(isDefined)
      .join(".")
  }

  protected number(model: IRModelNumeric) {
    const result = [this.joi, "number()"].filter(isDefined).join(".")

    if (model.enum) {
      return [result, `valid(${model.enum.join(", ")})`]
        .filter(isDefined)
        .join(".")
    }

    return result
  }

  protected string(model: IRModelString) {
    const result = [this.joi, "string()"].filter(isDefined).join(".")

    if (model.enum) {
      return [
        result,
        `valid(${model.enum.map(quotedStringLiteral).join(", ")})`,
      ]
        .filter(isDefined)
        .join(".")
    }

    return result
  }

  protected boolean() {
    return [this.joi, "boolean()"].filter(isDefined).join(".")
  }

  public any(): string {
    return [this.joi, "any()"].filter(isDefined).join(".")
  }

  public void(): string {
    return [this.joi, "any()", "valid(undefined)"].filter(isDefined).join(".")
  }
}
