// biome-ignore lint/style/useNodejsImportProtocol: todo
import path from "path"
import {Project, type SourceFile} from "ts-morph"
import type {IFsAdaptor} from "../../../core/file-system/fs-adaptor.ts"
import type {CompilerOptions} from "../../../core/loaders/tsconfig.loader.ts"
import {isTruthy} from "../../../core/utils.ts"
import type {OpenapiTypescriptGeneratorConfig} from "../../../templates.types.ts"
import {TypescriptFetchClientBuilder} from "../../client/typescript-fetch/typescript-fetch-client-builder.ts"
import {ImportBuilder} from "../../common/import-builder.ts"
import {schemaBuilderFactory} from "../../common/schema-builders/schema-builder.ts"
import {TypeBuilder} from "../../common/type-builder/type-builder.ts"
import {TypescriptNextjsAppRouterBuilder} from "./typescript-nextjs-app-router-builder.ts"
import {TypescriptNextjsRouterBuilder} from "./typescript-nextjs-router-builder.ts"

function findImportAlias(dest: string, compilerOptions: CompilerOptions) {
  const relative = `./${path.relative(process.cwd(), dest)}/*`

  const alias = Object.entries(compilerOptions.paths || {}).find(([, paths]) =>
    paths.some((p) => p === relative || relative.endsWith(p.substring(1))),
  )

  return alias ? alias[0].replace("*", "") : undefined
}

export async function generateTypescriptNextJS(
  config: OpenapiTypescriptGeneratorConfig,
): Promise<void> {
  const {input, emitter, allowAny} = config

  const importAlias = findImportAlias(
    config.emitter.config.destinationDirectory,
    config.compilerOptions,
  )

  // biome-ignore lint/complexity/useLiteralKeys: todo
  const subDirectory = process.env["OPENAPI_INTEGRATION_TESTS"]
    ? path.basename(config.input.loader.entryPointKey)
    : ""

  const appDirectory = [".", "app", subDirectory]
    .filter(isTruthy)
    .join(path.sep)

  const generatedDirectory = [".", "generated", subDirectory]
    .filter(isTruthy)
    .join(path.sep)

  const importBuilderConfig = {includeFileExtensions: false}
  const schemaBuilderImports = new ImportBuilder(importBuilderConfig)

  const rootTypeBuilder = await TypeBuilder.fromSchemaProvider(
    [generatedDirectory, "models.ts"].join(path.sep),
    input,
    config.compilerOptions,
    {allowAny},
  )

  const rootSchemaBuilder = await schemaBuilderFactory(
    [generatedDirectory, "schemas.ts"].join(path.sep),
    input,
    config.schemaBuilder,
    {allowAny},
    schemaBuilderImports,
    rootTypeBuilder,
  )

  const project = new Project({useInMemoryFileSystem: true})

  const serverRouters = (
    await Promise.all(
      input.groupedOperations("route").map(async (group) => {
        const filename = path.join(
          generatedDirectory,
          routeToNextJSFilepath(group.name),
        )

        const routerImports = new ImportBuilder({
          unit: {filename},
          includeFileExtensions: false,
          importAlias,
        })

        const routerBuilder = new TypescriptNextjsRouterBuilder(
          filename,
          group.name,
          input,
          routerImports,
          rootTypeBuilder.withImports(routerImports),
          rootSchemaBuilder.withImports(routerImports),
        )

        const nextJsAppRouterPath = path.join(
          appDirectory,
          routeToNextJSFilepath(group.name),
        )

        const appRouterImports = new ImportBuilder({
          unit: {filename: nextJsAppRouterPath},
          includeFileExtensions: false,
          importAlias,
        })

        const sourceFile = await loadExistingRouteImplementation({
          fsAdaptor: config.fsAdaptor,
          project,
          destinationDirectory: emitter.config.destinationDirectory,
          nextJsAppRouterPath,
        })

        const nextJSAppRouterBuilder = new TypescriptNextjsAppRouterBuilder(
          nextJsAppRouterPath,
          group.name,
          input,
          appRouterImports,
          rootTypeBuilder.withImports(appRouterImports),
          rootSchemaBuilder.withImports(appRouterImports),
          filename,
          sourceFile,
        )

        for (const operation of group.operations) {
          routerBuilder.add(operation)
          nextJSAppRouterBuilder.add(operation)
        }

        return [
          routerBuilder.toCompilationUnit(),
          nextJSAppRouterBuilder.toCompilationUnit(),
        ]
      }),
    )
  ).flat()

  const clientOutputPath = [generatedDirectory, "client.ts"].join(path.sep)
  const clientImportBuilder = new ImportBuilder({
    unit: {filename: clientOutputPath},
    importAlias,
    includeFileExtensions: false,
  })

  const fetchClientBuilder = new TypescriptFetchClientBuilder(
    clientOutputPath,
    "ApiClient",
    input,
    clientImportBuilder,
    rootTypeBuilder.withImports(clientImportBuilder),
    rootSchemaBuilder.withImports(clientImportBuilder),
    {
      enableRuntimeResponseValidation: config.enableRuntimeResponseValidation,
      enableTypedBasePaths: config.enableTypedBasePaths,
    },
  )

  input.allOperations().map((it) => fetchClientBuilder.add(it))

  await emitter.emitGenerationResult([
    ...serverRouters,
    fetchClientBuilder.toCompilationUnit(),
    rootTypeBuilder.toCompilationUnit(),
    rootSchemaBuilder.toCompilationUnit(),
  ])
}

async function loadExistingRouteImplementation({
  fsAdaptor,
  project,
  destinationDirectory,
  nextJsAppRouterPath,
}: {
  fsAdaptor: IFsAdaptor
  project: Project
  destinationDirectory: string
  nextJsAppRouterPath: string
}): Promise<SourceFile> {
  const exists = await fsAdaptor.exists(
    path.join(destinationDirectory, nextJsAppRouterPath),
  )

  const source = exists
    ? await fsAdaptor.readFile(
        path.join(destinationDirectory, nextJsAppRouterPath),
      )
    : ""

  return project.createSourceFile(nextJsAppRouterPath, source)
}

function routeToNextJSFilepath(route: string): string {
  const parts = route
    .split("/")
    .map((part) => part.replaceAll("{", "[").replaceAll("}", "]"))

  parts.push("route.ts")

  return path.join(...parts)
}
