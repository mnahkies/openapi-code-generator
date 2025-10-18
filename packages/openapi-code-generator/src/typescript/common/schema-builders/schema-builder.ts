import type {Input} from "../../../core/input"
import type {TypeBuilder} from "../type-builder"
import type {SchemaBuilderConfig} from "./abstract-schema-builder"
import {JoiBuilder} from "./joi-schema-builder"
import {ZodBuilder} from "./zod-schema-builder"

export type SchemaBuilder = ZodBuilder | JoiBuilder
export type SchemaBuilderType = "zod" | "joi"

export function schemaBuilderFactory(
  filename: string,
  input: Input,
  schemaBuilderType: SchemaBuilderType,
  schemaBuilderConfig: SchemaBuilderConfig,
  typeBuilder: TypeBuilder,
): Promise<SchemaBuilder> {
  switch (schemaBuilderType) {
    case "joi": {
      return JoiBuilder.fromInput(
        filename,
        input,
        schemaBuilderConfig,
        typeBuilder,
      )
    }

    case "zod": {
      return ZodBuilder.fromInput(
        filename,
        input,
        schemaBuilderConfig,
        typeBuilder,
      )
    }

    default:
      throw new Error(`schemaBuilderType '${schemaBuilderType}' not recognized`)
  }
}
