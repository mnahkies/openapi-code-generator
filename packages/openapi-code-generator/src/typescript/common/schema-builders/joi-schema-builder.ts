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

const joi = "joi"

export class JoiBuilder extends AbstractSchemaBuilder<JoiBuilder> {
  static async fromInput(filename: string, input: Input): Promise<JoiBuilder> {
    return new JoiBuilder(filename, input)
  }

  override withImports(imports: ImportBuilder): JoiBuilder {
    return new JoiBuilder(this.filename, this.input, {}, imports, this)
  }

  protected importHelpers(imports: ImportBuilder) {
    imports.addModule(joi, "@hapi/joi")
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
    return [joi, `link('#${schema}')`].join(".")
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
      joi,
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
      joi,
      "object()",
      `keys({${Object.entries(keys)
        .map(([key, value]) => `"${key}": ${value}`)
        .join(",")} })`,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected record(schema: string): string {
    return [joi, "object()", `pattern(${this.any()}, ${schema})`]
      .filter(isDefined)
      .join(".")
  }

  protected array(items: string[]): string {
    return [joi, "array()", `items(${items.join(",")})`]
      .filter(isDefined)
      .join(".")
  }

  protected number(model: IRModelNumeric) {
    const result = [joi, "number()"].filter(isDefined).join(".")

    if (model.enum) {
      return [result, `valid(${model.enum.join(", ")})`]
        .filter(isDefined)
        .join(".")
    }

    return [
      result,
      model.minimum ? `min(${model.minimum})` : undefined,
      model.maximum ? `max(${model.maximum})` : undefined,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected string(model: IRModelString) {
    const result = [joi, "string()"].filter(isDefined).join(".")

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
    return [joi, "boolean()"].filter(isDefined).join(".")
  }

  public any(): string {
    return [joi, "any()"].filter(isDefined).join(".")
  }

  public void(): string {
    return [joi, "any()", "valid(undefined)"].filter(isDefined).join(".")
  }
}
