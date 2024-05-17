import path from "path"

import {IFsAdaptor} from "./core/file-system/fs-adaptor"
import {Input} from "./core/input"
import {GenericLoader} from "./core/loaders/generic.loader"
import {loadTsConfigCompilerOptions} from "./core/loaders/tsconfig.loader"
import {logger} from "./core/logger"
import {OpenapiLoader} from "./core/openapi-loader"
import {OpenapiValidator} from "./core/openapi-validator"
import {templates} from "./templates"
import {TypescriptEmitter} from "./typescript/common/typescript-emitter"
import {TypescriptFormatter} from "./typescript/common/typescript-formatter"

export type Config = {
  input: string
  inputType: "openapi3" | "typespec"
  output: string
  template:
    | "typescript-fetch"
    | "typescript-axios"
    | "typescript-angular"
    | "typescript-koa"
  schemaBuilder: "zod" | "joi"
  enableRuntimeResponseValidation: boolean
  extractInlineSchemas: boolean
  allowUnusedImports: boolean
  groupingStrategy: "none" | "first-slug" | "first-tag"
}

export async function generate(
  config: Config,
  fsAdaptor: IFsAdaptor,
  formatter: TypescriptFormatter,
) {
  logger.time("program starting")
  logger.info(`running on input file '${config.input}'`)
  logger.time("load files")

  const compilerOptions = await loadTsConfigCompilerOptions(
    path.join(process.cwd(), config.output),
    fsAdaptor,
  )

  const validator = await OpenapiValidator.create()

  const genericLoader = new GenericLoader(fsAdaptor)

  const loader = await OpenapiLoader.create(
    {entryPoint: config.input, fileType: config.inputType},
    validator,
    genericLoader,
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
    compilerOptions,
    groupingStrategy: config.groupingStrategy,
  })
}
