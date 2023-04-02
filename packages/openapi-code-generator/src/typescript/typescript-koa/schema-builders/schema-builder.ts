import {Input} from "../../../core/input"
import {ImportBuilder} from "../../common/import-builder"
import {JoiBuilder} from "./joi-schema-builder"
import {ZodBuilder} from "./zod-schema-builder"
import {AbstractSchemaBuilder} from "./abstract-schema-builder"

export type SchemaBuilder = AbstractSchemaBuilder
export type SchemaBuilderType = "zod" | "joi"

function createSchemaBuilder(schemaBuilderType: SchemaBuilderType, input: Input) {
  switch (schemaBuilderType) {
    case "joi": {
      return new JoiBuilder("joi", input)
    }
    case "zod": {
      return new ZodBuilder("z", input)
    }
    default:
      throw new Error(`schemaBuilderType '${schemaBuilderType}' not recognized`)
  }
}

export function schemaBuilderFactory(schemaBuilderType: "zod" | "joi", input: Input, importBuilder: ImportBuilder): AbstractSchemaBuilder {
  const schemaBuilder = createSchemaBuilder(schemaBuilderType, input)

  schemaBuilder.importHelpers(importBuilder)

  return schemaBuilder
}
