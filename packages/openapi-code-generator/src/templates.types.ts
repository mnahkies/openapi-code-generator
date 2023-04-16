import {Input} from "./core/input"
import {SchemaBuilderType} from "./typescript/common/schema-builders/schema-builder"

export interface OpenapiGeneratorConfig {
  dest: string,
  input: Input,
  schemaBuilder: SchemaBuilderType
}

export interface OpenapiGenerator {
  (args: OpenapiGeneratorConfig): Promise<void>
}
