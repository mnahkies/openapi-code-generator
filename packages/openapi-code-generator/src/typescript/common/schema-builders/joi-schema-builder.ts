/**
 * @prettier
 */

import {Input} from "../../../core/input"
import {isDefined} from "../../../core/utils"
import {AbstractSchemaBuilder} from "./abstract-schema-builder"
import {ImportBuilder} from "../import-builder"
import {Reference} from "../../../core/openapi-types"
import {getSchemaNameFromRef} from "../../../core/openapi-utils"
import {ExportDefinition} from "../typescript-common"

enum JoiFn {
  Object = "object()",
  Array = "array()",
  Number = "number()",
  String = "string()",
  Boolean = "boolean()",
  Required = "required()",
}

export class JoiBuilder extends AbstractSchemaBuilder {
  constructor(
    private readonly joi = "joi",
    filename: string,
    input: Input,
    imports: ImportBuilder,
  ) {
    super(filename, input, imports)

    this.importHelpers(imports)
  }

  protected importHelpers(imports: ImportBuilder) {
    imports.addModule(this.joi, "@hapi/joi")
  }

  public parse(schema: string, value: string): string {
    return `await ${schema}.validateAsync(${value})`
  }

  public any(): string {
    return [this.joi, "any()"].filter(isDefined).join(".")
  }

  public void(): string {
    return [this.joi, "any()", "valid(undefined)"].filter(isDefined).join(".")
  }

  protected schemaFromRef(
    reference: Reference,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    imports: ImportBuilder,
  ): ExportDefinition {
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

  protected intersect(schemas: string[]): string {
    return schemas.filter(isDefined).reduce((acc, it) => {
      return `${acc}\n.concat(${it})`
    })
  }

  protected union(schemas: string[]): string {
    return [
      this.joi,
      `alternatives().try(${schemas
        .filter(isDefined)
        .map((it) => it)
        .join(",")})`,
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
    return [schema, JoiFn.Required].join(".")
  }

  protected object(keys: Record<string, string>): string {
    return [
      this.joi,
      JoiFn.Object,
      `keys({${Object.entries(keys)
        .map(([key, value]) => `"${key}": ${value}`)
        .join(",")} })`,
    ]
      .filter(isDefined)
      .join(".")
  }

  protected array(items: string[]): string {
    return [this.joi, JoiFn.Array, `items(${items.join(",")})`]
      .filter(isDefined)
      .join(".")
  }

  protected record(schema: string): string {
    return [this.joi, JoiFn.Object, `pattern(${this.any()}, ${schema})`]
      .filter(isDefined)
      .join(".")
  }

  protected number() {
    // todo: enum support

    return [this.joi, JoiFn.Number].filter(isDefined).join(".")
  }

  protected string() {
    // todo: enum support

    return [this.joi, JoiFn.String].filter(isDefined).join(".")
  }

  protected boolean() {
    return [this.joi, JoiFn.Boolean].filter(isDefined).join(".")
  }
}
