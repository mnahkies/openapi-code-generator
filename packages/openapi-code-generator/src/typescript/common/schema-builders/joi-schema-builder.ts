import {Input} from "../../../core/input"
import {IRModelString} from "../../../core/openapi-types-normalized"
import {isDefined} from "../../../core/utils"
import {AbstractSchemaBuilder} from "./abstract-schema-builder"
import {ImportBuilder} from "../import-builder"

enum JoiFn {
  Object = "object()",
  Array = "array()",
  Number = "number()",
  String = "string()",
  Boolean = "boolean()",
  Required = "required()"
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

    imports.from("@nahkies/typescript-koa-runtime/joi")
      .add("parseRequestInput", "Params", "responseValidationFactory")
  }


  protected importHelpers(imports: ImportBuilder) {
    imports.addModule(this.joi, "@hapi/joi")
  }

  public any(): string {
    return [
      this.joi,
      "any()",
    ].filter(isDefined).join(".")
  }

  public void(): string {
    return [
      this.joi,
      "any()",
      "valid(undefined)",
    ].filter(isDefined).join(".")
  }


  protected intersect(schemas: string[]): string {
    return schemas.filter(isDefined).reduce((acc, it) => {
      return `${acc}\n.concat(${it})`
    })
  }


  protected union(schemas: string[]): string {
    return [
      this.joi,
      `alternatives().try(${
        schemas.filter(isDefined).map(it => it).join(",")
      })`
    ].filter(isDefined).join(".")
  }

  protected nullable(schema: string): string {
    return [
      schema,
      "allow(null)",
    ].join(".")
  }

  protected object(keys: Record<string, string>, required: boolean): string {
    return [
      this.joi,
      JoiFn.Object,
      `keys({${Object.entries(keys).map(([key, value]) => `"${key}": ${value}`).join(",")} })`,
      required ? JoiFn.Required : undefined,
    ].filter(isDefined).join(".")
  }

  protected array(items: string[], required: boolean): string {
    return [
      this.joi,
      JoiFn.Array,
      `items(${items.join(",")})`,
      required ? JoiFn.Required : undefined,
    ].filter(isDefined).join(".")
  }

  protected number(required: boolean) {
    return [
      this.joi,
      JoiFn.Number,
      required ? JoiFn.Required : undefined,
    ].filter(isDefined).join(".")
  }

  protected string(model: IRModelString, required: boolean) {
    // todo: enum support

    return [
      this.joi,
      JoiFn.String,
      required ? JoiFn.Required : undefined,
    ].filter(isDefined).join(".")
  }

  protected boolean(required: boolean) {
    return [
      this.joi,
      JoiFn.Boolean,
      required ? JoiFn.Required : undefined,
    ].filter(isDefined).join(".")
  }

}
