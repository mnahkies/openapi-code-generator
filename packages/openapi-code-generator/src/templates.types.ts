import type {Input, OperationGroupStrategy} from "./core/input"
import type {CompilerOptions} from "./core/loaders/tsconfig.loader"
import type {SchemaBuilderType} from "./typescript/common/schema-builders/schema-builder"
import type {TypescriptEmitter} from "./typescript/common/typescript-emitter"

export interface OpenapiGeneratorConfig {
  input: Input
  emitter: TypescriptEmitter
  enableRuntimeResponseValidation: boolean
  enableTypedBasePaths: boolean
  groupingStrategy: OperationGroupStrategy
}

export interface OpenapiTypescriptGeneratorConfig
  extends OpenapiGeneratorConfig {
  /**
   * Which runtime schema parsing library to use
   */
  schemaBuilder: SchemaBuilderType
  /**
   * Sub-set of typescript compiler options relevant to codegen
   */
  compilerOptions: CompilerOptions
  /**
   * Whether to use `any` or `unknown` for unspecified types
   */
  allowAny: boolean
}
