import type {Input} from "../../../core/input"
import type {Reference} from "../../../core/openapi-types"
import type {
  IRModel,
  IRModelArray,
  IRModelBoolean,
  IRModelNumeric,
  IRModelString,
  MaybeIRModel,
} from "../../../core/openapi-types-normalized"
import {getSchemaNameFromRef} from "../../../core/openapi-utils"
import {hasSingleElement, isDefined} from "../../../core/utils"
import type {ImportBuilder} from "../import-builder"
import type {TypeBuilder} from "../type-builder"
import {quotedStringLiteral} from "../type-utils"
import type {ExportDefinition} from "../typescript-common"
import {
  AbstractSchemaBuilder,
  type SchemaBuilderConfig,
} from "./abstract-schema-builder"

const zod = "z"

export const staticSchemas = {
  PermissiveBoolean: `${zod}.preprocess((value) => {
          if(typeof value === "string" && (value === "true" || value === "false")) {
            return value === "true"
          } else if(typeof value === "number" && (value === 1 || value === 0)) {
            return value === 1
          }
          return value
        }, ${zod}.boolean())`,
  PermissiveLiteralTrue: `${zod}.preprocess((value) => {
          return PermissiveBoolean.parse(value)
        }, ${zod}.literal(true))`,
  PermissiveLiteralFalse: `${zod}.preprocess((value) => {
          return PermissiveBoolean.parse(value)
        }, ${zod}.literal(false))`,
}

export type StaticSchemas = typeof staticSchemas

export class ZodV4Builder extends AbstractSchemaBuilder<
  ZodV4Builder,
  StaticSchemas
> {
  readonly type = "zod-v4"

  static async fromInput(
    filename: string,
    input: Input,
    schemaBuilderConfig: SchemaBuilderConfig,
    typeBuilder: TypeBuilder,
  ): Promise<ZodV4Builder> {
    return new ZodV4Builder(
      filename,
      input,
      schemaBuilderConfig,
      typeBuilder,
      staticSchemas,
    )
  }

  override withImports(imports: ImportBuilder): ZodV4Builder {
    return new ZodV4Builder(
      this.filename,
      this.input,
      this.config,
      this.typeBuilder,
      staticSchemas,
      {},
      new Set(),
      imports,
      this,
    )
  }

  protected importHelpers(imports: ImportBuilder) {
    imports.from("zod/v4").add(zod)
  }

  public parse(schema: string, value: string): string {
    return `${schema}.parse(${value})`
  }

  public schemaTypeForType(type: string): string {
    return type ? `${zod}.ZodType<${type}>` : ""
  }

  protected schemaFromRef(reference: Reference): ExportDefinition {
    const name = getSchemaNameFromRef(reference)
    const schemaObject = this.input.schema(reference)

    const value = this.fromModel(schemaObject, true)

    let type = ""

    // todo: bit hacky, but it will work for now.
    if (value.includes("z.lazy(")) {
      type = this.typeBuilder.schemaObjectToType(reference)
    }

    return {
      name,
      type: this.schemaTypeForType(type),
      value,
      kind: "const",
    }
  }

  protected lazy(schema: string): string {
    return [zod, `lazy(() => ${schema})`].join(".")
  }

  protected merge(schemas: string[]): string {
    const definedSchemas = schemas.filter(isDefined)

    if (definedSchemas.length === 1 && definedSchemas[0]) {
      return definedSchemas[0]
    }

    // todo: .merge is deprecated in v4, plan migration to .extend
    return definedSchemas.reduce((acc, it) => {
      return `${acc}\n.merge(${it})`
    })
  }

  protected intersect(schemas: string[]): string {
    const definedSchemas = schemas.filter(isDefined)

    if (definedSchemas.length === 1 && definedSchemas[0]) {
      return definedSchemas[0]
    }

    return definedSchemas.reduce((acc, it) => {
      return `${zod}.intersection(${acc}, ${it})`
    })
  }

  protected union(schemas: string[]): string {
    const definedSchemas = schemas.filter(isDefined)

    if (hasSingleElement(definedSchemas)) {
      return definedSchemas[0]
    }

    return [
      zod,
      `union([\n${definedSchemas.map((it) => `${it},`).join("\n")}\n])`,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected preprocess(
    schema: string,
    transformation: string | ((it: unknown) => unknown),
  ) {
    return [zod, `preprocess(${transformation.toString()}, ${schema})`]
      .filter(isDefined)
      .join(".")
  }

  protected nullable(schema: string): string {
    return [schema, "nullable()"].filter(isDefined).join(".")
  }

  protected optional(schema: string): string {
    return [schema, "optional()"].filter(isDefined).join(".")
  }

  protected required(schema: string): string {
    return schema
  }

  protected object(keys: Record<string, string>): string {
    const entries = Object.entries(keys)

    return [
      zod,
      `object({${entries
        .map(([key, value]) => `"${key}": ${value}`)
        .join(",")}})`,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected record(schema: string): string {
    // note: openapi doesn't currently support records with numeric keys
    return [zod, `record(${zod}.string(), ${schema})`]
      .filter(isDefined)
      .join(".")
  }

  protected array(model: IRModelArray, items: string[]): string {
    return [
      zod,
      `array(${items.join(",")})`,
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
      // todo: this will always fail validation for object/array item types, as it
      //       does a strict equality. Need to implement a deep equals check
      model.uniqueItems
        ? 'refine((array) => new Set([...array]).size === array.length, {message: "Array must contain unique element(s)"})'
        : undefined,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected arrayItems(model: MaybeIRModel): string {
    return this.fromModel(model, true)
  }

  protected number(model: IRModelNumeric) {
    if (model.enum) {
      if (model["x-enum-extensibility"] === "open") {
        this.schemaBuilderImports.addSingle(
          "UnknownEnumNumberValue",
          "./models",
          false,
        )
        return [
          this.union([
            ...model.enum.map((it) => [zod, `literal(${it})`].join(".")),
            "z.number().transform(it => it as (typeof it & UnknownEnumNumberValue))",
          ]),
        ]
          .filter(isDefined)
          .join(".")
      }

      if (model["x-enum-extensibility"] === "closed") {
        return [
          this.union(model.enum.map((it) => [zod, `literal(${it})`].join("."))),
        ]
          .filter(isDefined)
          .join(".")
      }

      throw new Error(
        `enum specified, but x-enum-extensibility is '${model["x-enum-extensibility"]}'`,
      )
    }

    return [
      zod,
      "coerce.number()",
      Number.isFinite(model.multipleOf)
        ? `multipleOf(${model.multipleOf})`
        : undefined,
      Number.isFinite(model.exclusiveMinimum)
        ? `gt(${model.exclusiveMinimum})`
        : Number.isFinite(model.minimum)
          ? `min(${model.minimum})`
          : undefined,
      Number.isFinite(model.exclusiveMaximum)
        ? `lt(${model.exclusiveMaximum})`
        : Number.isFinite(model.maximum)
          ? `max(${model.maximum})`
          : undefined,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected string(model: IRModelString) {
    if (model.enum) {
      if (model["x-enum-extensibility"] === "open") {
        this.schemaBuilderImports.addSingle(
          "UnknownEnumStringValue",
          "./models",
          false,
        )
        return this.union([
          this.stringEnum(model),
          "z.string().transform(it => it as (typeof it & UnknownEnumStringValue))",
        ])
      }

      if (model["x-enum-extensibility"] === "closed") {
        return this.stringEnum(model)
      }

      throw new Error(
        `enum specified, but x-enum-extensibility is '${model["x-enum-extensibility"]}'`,
      )
    }

    // todo: add support for date, time
    const base =
      model.format === "date-time"
        ? "iso.datetime({offset:true})"
        : model.format === "email"
          ? "email()"
          : "string()"

    return [
      zod,
      base,
      Number.isFinite(model.minLength) ? `min(${model.minLength})` : undefined,
      Number.isFinite(model.maxLength) ? `max(${model.maxLength})` : undefined,
      model.pattern
        ? `regex(new RegExp("${model.pattern
            .replaceAll("\\", "\\\\")
            .replaceAll('"', '\\"')}"))`
        : undefined,
    ]
      .filter(isDefined)
      .join(".")
  }

  private stringEnum(model: IRModelString) {
    if (!model.enum) {
      throw new Error("model is not an enum")
    }

    return [zod, `enum([${model.enum.map(quotedStringLiteral).join(",")}])`]
      .filter(isDefined)
      .join(".")
  }

  protected boolean(model: IRModelBoolean) {
    // if a boolean is coming from a query string / url parameter, then we need
    // to be a bit more lenient in our parsing.
    // todo: switch to stricter parsing when property is part of a request body/response
    // todo: might be nice to have an x-extension prop that lets the user define the
    //       true/false mapping in their schema.

    if (model.enum) {
      this.addStaticSchema("PermissiveBoolean")

      return this.union(
        model.enum.map((it) => {
          if (it === "true") {
            return this.addStaticSchema("PermissiveLiteralTrue")
          } else if (it === "false") {
            return this.addStaticSchema("PermissiveLiteralFalse")
          }
          throw new Error(`unsupported boolean enum value '${it}'`)
        }),
      )
    }

    return this.addStaticSchema("PermissiveBoolean")
  }

  public any(): string {
    return [zod, "any()"].filter(isDefined).join(".")
  }

  public never(): string {
    return [zod, "never()"].filter(isDefined).join(".")
  }

  protected override unknown(): string {
    return [zod, "unknown()"].filter(isDefined).join(".")
  }

  protected override default(schema: string, model: IRModel): string {
    // It's easy to accidentally use a boolean or number instead of a string
    // for stuff like this, eg: https://github.com/github/rest-api-description/issues/3878
    // lets coerce defaults to be strings when the model type is expecting that.
    const needsWrapping =
      model.type === "string" &&
      typeof model.default !== "string" &&
      !(model.nullable && model.default === null)
    const defaultValue = JSON.stringify(model.default)

    return [
      schema,
      `default(${needsWrapping ? `"${defaultValue}"` : defaultValue})`,
    ]
      .filter(isDefined)
      .join(".")
  }

  public void(): string {
    return [zod, "undefined()"].filter(isDefined).join(".")
  }
}
