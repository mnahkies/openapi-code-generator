import {Input} from "../../../core/input"
import {ImportBuilder} from "../import-builder"
import {JoiBuilder} from "./joi-schema-builder"
import {ZodBuilder} from "./zod-schema-builder"
import {AbstractSchemaBuilder} from "./abstract-schema-builder"

export type SchemaBuilder = AbstractSchemaBuilder
export type SchemaBuilderType = "zod" | "joi"

export function schemaBuilderFactory(schemaBuilderType: SchemaBuilderType, input: Input, importBuilder: ImportBuilder): AbstractSchemaBuilder {
  switch (schemaBuilderType) {
    case "joi": {
      return new JoiBuilder("joi", "./schemas.ts", input, importBuilder)
    }
    case "zod": {
      return new ZodBuilder("z", "./schemas.ts", input, importBuilder)
    }
    default:
      throw new Error(`schemaBuilderType '${schemaBuilderType}' not recognized`)
  }
}
