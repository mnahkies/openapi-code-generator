import {CompilerOptions} from "./core/file-loader"
import {Input} from "./core/input"
import {SchemaBuilderType} from "./typescript/common/schema-builders/schema-builder"

export interface OpenapiGeneratorConfig {
  dest: string
  input: Input
  schemaBuilder: SchemaBuilderType
  enableRuntimeResponseValidation: boolean
  compilerOptions: CompilerOptions
  allowUnusedImports: boolean
}

export interface OpenapiGenerator {
  (args: OpenapiGeneratorConfig): Promise<void>
}
