import {Input, OperationGroupStrategy} from "./core/input"
import {CompilerOptions} from "./core/loaders/tsconfig.loader"
import {SchemaBuilderType} from "./typescript/common/schema-builders/schema-builder"
import {TypeBuilderConfig} from "./typescript/common/type-builder"
import {TypescriptEmitter} from "./typescript/common/typescript-emitter"

export interface OpenapiGeneratorConfig {
  input: Input
  emitter: TypescriptEmitter
  schemaBuilder: SchemaBuilderType
  enableRuntimeResponseValidation: boolean
  compilerOptions: CompilerOptions
  typeConfig: TypeBuilderConfig
  groupingStrategy: OperationGroupStrategy
}

export interface OpenapiGenerator {
  (args: OpenapiGeneratorConfig): Promise<void>
}
