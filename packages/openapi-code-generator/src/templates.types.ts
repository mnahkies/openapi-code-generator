import {Input} from "./core/input"
import {SchemaBuilderType} from "./typescript/common/schema-builders/schema-builder"
import {CompilerOptions} from "./core/file-loader"

export interface OpenapiGeneratorConfig {
  dest: string
  input: Input
  schemaBuilder: SchemaBuilderType
  enableRuntimeResponseValidation: boolean
  compilerOptions: CompilerOptions
}

export interface OpenapiGenerator {
  (args: OpenapiGeneratorConfig): Promise<void>
}
