import type {Input, OperationGroupStrategy} from "./core/input"
import type {CompilerOptions} from "./core/loaders/tsconfig.loader"
import type {IdentifierConvention} from "./core/utils"
import type {SchemaBuilderType} from "./typescript/common/schema-builders/schema-builder"
import type {TypescriptEmitter} from "./typescript/common/typescript-emitter"

export type OpenapiGenerator = {
  language: "typescript"
  type: "client" | "server"
  run: (config: OpenapiTypescriptGeneratorConfig) => Promise<void>
}

export type ServerImplementationMethod = "interface" | "type" | "abstract-class"

export interface OpenapiGeneratorConfig {
  input: Input
  emitter: TypescriptEmitter
  enableRuntimeResponseValidation: boolean
  enableTypedBasePaths: boolean
  groupingStrategy: OperationGroupStrategy
  filenameConvention: IdentifierConvention
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
  /**
   * How to output the implementation types for server templates
   */
  serverImplementationMethod: ServerImplementationMethod
}
