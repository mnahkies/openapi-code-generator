import type {IFsAdaptor} from "./core/file-system/fs-adaptor"
import {Input} from "./core/input"
import type {IFormatter} from "./core/interfaces"
import {
  GenericLoader,
  type GenericLoaderRequestHeaders,
} from "./core/loaders/generic.loader"
import type {CompilerOptions} from "./core/loaders/tsconfig.loader"
import type {TypespecLoader} from "./core/loaders/typespec.loader"
import {logger} from "./core/logger"
import {OpenapiLoader} from "./core/openapi-loader"
import type {OpenapiValidator} from "./core/openapi-validator"
import type {IdentifierConvention} from "./core/utils"
import {templates} from "./templates"
import type {ServerImplementationMethod} from "./templates.types"
import {TypescriptEmitter} from "./typescript/common/typescript-emitter"

export type Config = {
  input: string
  inputType: "openapi3" | "typespec"
  overrideSpecificationTitle?: string | undefined
  output: string
  template:
    | "typescript-fetch"
    | "typescript-axios"
    | "typescript-angular"
    | "typescript-koa"
  schemaBuilder: "zod" | "joi"
  enableRuntimeResponseValidation: boolean
  enableTypedBasePaths: boolean
  extractInlineSchemas: boolean
  allowUnusedImports: boolean
  groupingStrategy: "none" | "first-slug" | "first-tag"
  filenameConvention: IdentifierConvention
  tsAllowAny: boolean
  tsServerImplementationMethod: ServerImplementationMethod
  tsCompilerOptions: CompilerOptions
  remoteSpecRequestHeaders?: GenericLoaderRequestHeaders | undefined
}

export async function generate(
  config: Config,
  fsAdaptor: IFsAdaptor,
  formatter: IFormatter,
  validator: OpenapiValidator,
  typespecLoader: TypespecLoader,
) {
  logger.time("program starting")
  logger.info(`running on input file '${config.input}'`)
  logger.time("load files")

  const genericLoader = new GenericLoader(
    fsAdaptor,
    config.remoteSpecRequestHeaders,
  )
  const loader = await OpenapiLoader.create(
    {
      entryPoint: config.input,
      fileType: config.inputType,
      titleOverride: config.overrideSpecificationTitle,
    },
    validator,
    genericLoader,
    typespecLoader,
  )

  const input = new Input(loader, {
    extractInlineSchemas: config.extractInlineSchemas,
  })

  const generator = templates[config.template]

  const emitter = new TypescriptEmitter(fsAdaptor, formatter, {
    destinationDirectory: config.output,
    allowUnusedImports: config.allowUnusedImports,
  })

  await generator({
    input,
    emitter,
    schemaBuilder: config.schemaBuilder,
    enableRuntimeResponseValidation: config.enableRuntimeResponseValidation,
    enableTypedBasePaths: config.enableTypedBasePaths,
    compilerOptions: config.tsCompilerOptions,
    groupingStrategy: config.groupingStrategy,
    filenameConvention: config.filenameConvention,
    allowAny: config.tsAllowAny,
    serverImplementationMethod: config.tsServerImplementationMethod,
  })
}
