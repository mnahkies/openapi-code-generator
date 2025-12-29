import type {Input} from "../../../core/input"
import type {ImportBuilder} from "../import-builder"
import type {TypeBuilder} from "../type-builder/type-builder"
import type {SchemaBuilderConfig} from "./abstract-schema-builder"
import {JoiBuilder} from "./joi-schema-builder"
import {ZodV3Builder} from "./zod-v3-schema-builder"
import {ZodV4Builder} from "./zod-v4-schema-builder"

export type SchemaBuilder = ZodV3Builder | ZodV4Builder | JoiBuilder
export type SchemaBuilderType = "zod-v3" | "zod-v4" | "joi"

export function schemaBuilderFactory(
  filename: string,
  input: Input,
  schemaBuilderType: SchemaBuilderType,
  schemaBuilderConfig: SchemaBuilderConfig,
  schemaBuilderImports: ImportBuilder,
  typeBuilder: TypeBuilder,
): Promise<SchemaBuilder> {
  switch (schemaBuilderType) {
    case "joi": {
      return JoiBuilder.fromInput(
        filename,
        input,
        schemaBuilderConfig,
        schemaBuilderImports,
        typeBuilder,
      )
    }

    case "zod-v3": {
      return ZodV3Builder.fromInput(
        filename,
        input,
        schemaBuilderConfig,
        schemaBuilderImports,
        typeBuilder,
      )
    }

    case "zod-v4": {
      return ZodV4Builder.fromInput(
        filename,
        input,
        schemaBuilderConfig,
        schemaBuilderImports,
        typeBuilder,
      )
    }

    default:
      throw new Error(`schemaBuilderType '${schemaBuilderType}' not recognized`)
  }
}
