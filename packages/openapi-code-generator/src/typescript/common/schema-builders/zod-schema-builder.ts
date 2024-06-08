import type {Input} from "../../../core/input"
import type {Reference} from "../../../core/openapi-types"
import type {
  IRModelArray,
  IRModelNumeric,
  IRModelString,
} from "../../../core/openapi-types-normalized"
import {
  getSchemaNameFromRef,
  getTypeNameFromRef,
} from "../../../core/openapi-utils"
import {hasSingleElement, isDefined} from "../../../core/utils"
import type {ImportBuilder} from "../import-builder"
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
}
type StaticSchemas = typeof staticSchemas

export class ZodBuilder extends AbstractSchemaBuilder<
  ZodBuilder,
  StaticSchemas
> {
  static async fromInput(
    filename: string,
    input: Input,
    schemaBuilderConfig: SchemaBuilderConfig,
  ): Promise<ZodBuilder> {
    return new ZodBuilder(filename, input, schemaBuilderConfig, staticSchemas)
  }

  override withImports(imports: ImportBuilder): ZodBuilder {
    return new ZodBuilder(
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
    imports.from("zod").add(zod)
  }

  public parse(schema: string, value: string): string {
    return `${schema}.parse(${value})`
  }

  protected schemaFromRef(
    reference: Reference,
    schemaBuilderImports: ImportBuilder,
  ): ExportDefinition {
    const name = getSchemaNameFromRef(reference)
    const schemaObject = this.input.schema(reference)

    const value = this.fromModel(schemaObject, true)

    let type = ""

    // todo: bit hacky, but it will work for now.
    if (value.includes("z.lazy(")) {
      type = getTypeNameFromRef(reference)
      schemaBuilderImports.addSingle(type, "./models")
    }

    return {
      name,
      type: type ? `${zod}.ZodType<${type}, z.ZodTypeDef, unknown>` : "",
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

  protected transform(
    schema: string,
    transformation: string | ((it: unknown) => unknown),
  ) {
    return [schema, `transform(${transformation.toString()})`]
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
    return [zod, `record(${schema})`].filter(isDefined).join(".")
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
      // TODO: this will always fail validation for object/array item types, as it
      //       does a strict equality. Need to implement a deep equals check
      model.uniqueItems
        ? 'refine((array) => new Set([...array]).size === array.length, {message: "Array must contain unique element(s)"})'
        : undefined,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected number(model: IRModelNumeric) {
    if (model.enum) {
      // TODO: replace with enum after https://github.com/colinhacks/zod/issues/2686
      return [
        this.union(model.enum.map((it) => [zod, `literal(${it})`].join("."))),
      ]
        .filter(isDefined)
        .join(".")
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
      return this.stringEnum(model)
    }

    return [
      zod,
      "string()",
      Number.isFinite(model.minLength) ? `min(${model.minLength})` : undefined,
      Number.isFinite(model.maxLength) ? `max(${model.maxLength})` : undefined,
      model.pattern
        ? `regex(new RegExp("${model.pattern
            .replaceAll("\\", "\\\\")
            .replaceAll('"', '\\"')}"))`
        : undefined,
      model.format === "date-time" ? "datetime({offset:true})" : undefined,
      model.format === "email" ? "email()" : undefined,
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

  protected boolean() {
    // if a boolean is coming from a query string / url parameter, then we need
    // to be a bit more lenient in our parsing.
    // todo: switch to stricter parsing when property is part of a request body/response
    // todo: might be nice to have an x-extension prop that lets the user define the
    //       true/false mapping in their schema.
    return this.addStaticSchema("PermissiveBoolean")
  }

  protected any(): string {
    return [zod, "any()"].filter(isDefined).join(".")
  }

  protected override unknown(): string {
    return [zod, "unknown()"].filter(isDefined).join(".")
  }

  public void(): string {
    return [zod, "undefined()"].filter(isDefined).join(".")
  }
}
