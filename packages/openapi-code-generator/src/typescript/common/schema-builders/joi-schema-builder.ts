import type {Input} from "../../../core/input"
import type {Reference} from "../../../core/openapi-types"
import type {
  IRModel,
  IRModelArray,
  IRModelBase,
  IRModelNumeric,
  IRModelString,
} from "../../../core/openapi-types-normalized"
import {getSchemaNameFromRef} from "../../../core/openapi-utils"
import {hasSingleElement, isDefined} from "../../../core/utils"
import type {ImportBuilder} from "../import-builder"
import {quotedStringLiteral} from "../type-utils"
import type {ExportDefinition} from "../typescript-common"
import {
  AbstractSchemaBuilder,
  type SchemaBuilderConfig,
} from "./abstract-schema-builder"

const joi = "joi"

const staticSchemas = {}
type StaticSchemas = typeof staticSchemas

export class JoiBuilder extends AbstractSchemaBuilder<
  JoiBuilder,
  StaticSchemas
> {
  static async fromInput(
    filename: string,
    input: Input,
    schemaBuilderConfig: SchemaBuilderConfig,
  ): Promise<JoiBuilder> {
    return new JoiBuilder(filename, input, schemaBuilderConfig, staticSchemas)
  }

  override withImports(imports: ImportBuilder): JoiBuilder {
    return new JoiBuilder(
      this.filename,
      this.input,
      this.config,
      staticSchemas,
      {},
      new Set(),
      imports,
      this,
    )
  }

  protected importHelpers(imports: ImportBuilder) {
    imports.addModule(joi, "joi")
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
      value: `${value}.id("${name}")`,
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

  protected preprocess(
    schema: string,
    transformation: string | ((it: unknown) => unknown),
  ) {
    // TODO: yep this is horrid, but trying to create an extension like:
    //       joi.extend({type: 'maybeArray', prepare: (it) => ({value: Array.isArray(it) || it === undefined ? it : [it]})})
    //       doesn't appear to be chainable, so not sure where else to go, eg:
    //       > custom.maybeArray().validate([1,2])
    //       { value: [ 1, 2 ] }
    //       > custom.maybeArray().validate(1)
    //       { value: [ 1 ] }
    //       > custom.maybeArray().array().items(custom.string()).validate([1,2])
    //       Uncaught TypeError: custom.maybeArray(...).array is not a function
    return `{
      validate(it: unknown, opts: any) {
        const transformation = ${transformation.toString()}
        return ${schema}.validate(transformation(it), opts)}
      }`
  }

  protected nullable(schema: string): string {
    return [schema, "allow(null)"].join(".")
  }

  protected optional(schema: string): string {
    return schema
  }

  protected required(schema: string, hasDefaultValue: boolean): string {
    // HACK: joi.number().required().default(42).validate(undefined) always
    //       throws `Error [ValidationError]: "value" is required` so never
    //       mark values with defaults as required.
    if (hasDefaultValue) {
      return schema
    }

    // HACK: avoid `joi.string().allow(null).required().required()`
    if (schema.split(".").pop() === "required()") {
      return schema
    }

    return [schema, "required()"].join(".")
  }

  protected object(keys: Record<string, string>): string {
    const entries = Object.entries(keys)

    return [
      joi,
      "object()",
      `keys({${entries
        .map(([key, value]) => `"${key}": ${value}`)
        .join(",")} })`,
      "options({ stripUnknown: true })",
    ]
      .filter(isDefined)
      .join(".")
  }

  protected record(schema: string): string {
    return [joi, "object()", `pattern(${this.any()}, ${schema})`]
      .filter(isDefined)
      .join(".")
  }

  protected array(model: IRModelArray, items: string[]): string {
    return [
      joi,
      "array()",
      `items(${items.join(",")})`,
      model.uniqueItems ? "unique()" : undefined,
      Number.isFinite(model.minItems) &&
      model.minItems !== undefined &&
      model.minItems >= 0
        ? `min(${model.minItems})`
        : undefined,
      Number.isFinite(model.maxItems) &&
      model.maxItems !== undefined &&
      model.maxItems >= 0
        ? `max(${model.maxItems})`
        : undefined,
    ]
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
      Number.isFinite(model.multipleOf)
        ? `multiple(${model.multipleOf})`
        : undefined,
      Number.isFinite(model.exclusiveMinimum)
        ? `greater(${model.exclusiveMinimum})`
        : Number.isFinite(model.minimum)
          ? `min(${model.minimum})`
          : undefined,
      Number.isFinite(model.exclusiveMaximum)
        ? `less(${model.exclusiveMaximum})`
        : Number.isFinite(model.maximum)
          ? `max(${model.maximum})`
          : undefined,
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

    return [
      result,
      Number.isFinite(model.minLength) ? `min(${model.minLength})` : undefined,
      Number.isFinite(model.maxLength) ? `max(${model.maxLength})` : undefined,
      model.pattern
        ? `pattern(new RegExp("${model.pattern
            .replaceAll("\\", "\\\\")
            .replaceAll('"', '\\"')}"))`
        : undefined,
      model.format === "date-time" ? "isoDate()" : undefined,
      model.format === "email" ? "email()" : undefined,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected boolean() {
    return [joi, "boolean()", "truthy(1)", "falsy(0)"]
      .filter(isDefined)
      .join(".")
  }

  public any(): string {
    return [joi, "any()"].filter(isDefined).join(".")
  }

  protected override unknown(): string {
    return this.any()
  }

  protected override default(schema: string, model: IRModel): string {
    // It's easy to accidentally use a boolean or number instead of a string
    // for stuff like this, eg: https://github.com/github/rest-api-description/issues/3878
    // lets coerce defaults to be strings when the model type is expecting that.
    const needsWrapping =
      model.type === "string" && typeof model.default !== "string"
    const defaultValue = JSON.stringify(model.default)

    return [
      schema,
      `default(${needsWrapping ? `"${defaultValue}"` : defaultValue})`,
    ]
      .filter(isDefined)
      .join(".")
  }

  public void(): string {
    return [joi, "any()", "valid(undefined)"].filter(isDefined).join(".")
  }
}
