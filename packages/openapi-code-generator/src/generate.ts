import type {Config} from "./config.ts"
import type {IFsAdaptor} from "./core/file-system/fs-adaptor.ts"
import {Input} from "./core/input.ts"
import type {IFormatter} from "./core/interfaces.ts"
import {GenericLoader} from "./core/loaders/generic.loader.ts"
import {OpenapiLoader} from "./core/loaders/openapi-loader.ts"
import type {TypespecLoader} from "./core/loaders/typespec.loader.ts"
import {logger} from "./core/logger.ts"
import type {IOpenapiValidator} from "./core/openapi-validator.ts"
import {templates} from "./templates.ts"
import type {OpenapiGenerator} from "./templates.types.ts"
import {TypescriptEmitter} from "./typescript/common/typescript-emitter.ts"

function enumExtensibility(
  config: Config,
  generator: OpenapiGenerator,
): "open" | "closed" {
  if (config.enumExtensibility) {
    return config.enumExtensibility
  }

  if (generator.type === "client") {
    return "open"
  }

  if (generator.type === "server") {
    return "closed"
  }

  throw new Error(`Unsupported generator type '${generator.type}'`)
}

export async function generate(
  config: Config,
  fsAdaptor: IFsAdaptor,
  formatter: IFormatter,
  validator: IOpenapiValidator,
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

  const generator = templates[config.template]

  const input = new Input(
    loader,
    {
      extractInlineSchemas: config.extractInlineSchemas,
      enumExtensibility: enumExtensibility(config, generator),
    },
    generator.syntheticNameGenerator,
  )

  const emitter = new TypescriptEmitter(fsAdaptor, formatter, {
    destinationDirectory: config.output,
    allowUnusedImports: config.allowUnusedImports,
  })

  if (
    config.tsIsEsmProject &&
    !config.tsCompilerOptions.rewriteRelativeImportExtensions
  ) {
    logger.warn(
      `Generating in ESM mode, but typescript compiler option "rewriteRelativeImportExtensions" is not set to true. This may result in broken imports.`,
    )
  }

  await generator.run({
    input,
    emitter,
    schemaBuilder: config.schemaBuilder,
    enableRuntimeResponseValidation: config.enableRuntimeResponseValidation,
    enableTypedBasePaths: config.enableTypedBasePaths,
    compilerOptions: config.tsCompilerOptions,
    groupingStrategy: config.groupingStrategy,
    filenameConvention: config.filenameConvention,
    isEsmProject: config.tsIsEsmProject,
    allowAny: config.tsAllowAny,
    serverImplementationMethod: config.tsServerImplementationMethod,
  })
}
