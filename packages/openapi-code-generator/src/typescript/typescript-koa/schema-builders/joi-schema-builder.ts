import {Input} from "../../../core/input"
import {IRModelString} from "../../../core/openapi-types-normalized"
import {isDefined} from "../../../core/utils"
import {AbstractSchemaBuilder} from "./abstract-schema-builder"
import {ImportBuilder} from "../../common/import-builder"

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
    input: Input,
  ) {
    super(input)
  }

  importHelpers(importBuilder: ImportBuilder) {
    importBuilder.addModule(this.joi, "@hapi/joi")

    importBuilder.from("@nahkies/typescript-koa-runtime/joi")
      .add("parseRequestInput", "Params")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected intersect(schemas: string[]): string {
    // TODO: implement
    throw new Error("Method not implemented.")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected union(schemas: string[]): string {
    // TODO: implement
    throw new Error("Method not implemented.")
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
    // TODO: enum support

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
