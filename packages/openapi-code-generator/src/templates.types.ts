import {Input, OperationGroupStrategy} from "./core/input"
import {CompilerOptions} from "./core/loaders/tsconfig.loader"
import {SchemaBuilderType} from "./typescript/common/schema-builders/schema-builder"

export interface OpenapiGeneratorConfig {
  dest: string
  input: Input
  schemaBuilder: SchemaBuilderType
  enableRuntimeResponseValidation: boolean
  compilerOptions: CompilerOptions
  allowUnusedImports: boolean
  groupingStrategy: OperationGroupStrategy
}

export interface OpenapiGenerator {
  (args: OpenapiGeneratorConfig): Promise<void>
}
