import {Input} from "../../../core/input"
import {JoiBuilder} from "./joi-schema-builder"
import {ZodBuilder} from "./zod-schema-builder"

export type SchemaBuilder = ZodBuilder | JoiBuilder
export type SchemaBuilderType = "zod" | "joi"

export function schemaBuilderFactory(
  filename: string = "./schemas.ts",
  input: Input,
  schemaBuilderType: SchemaBuilderType,
): Promise<SchemaBuilder> {
  switch (schemaBuilderType) {
    case "joi": {
      return JoiBuilder.fromInput(filename, input)
    }

    case "zod": {
      return ZodBuilder.fromInput(filename, input)
    }

    default:
      throw new Error(`schemaBuilderType '${schemaBuilderType}' not recognized`)
  }
}
