// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import fs from "fs"
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import path from "path"
import {Project} from "ts-morph"
import type {CompilerOptions} from "../../../core/loaders/tsconfig.loader"
import {isTruthy} from "../../../core/utils"
import type {OpenapiTypescriptGeneratorConfig} from "../../../templates.types"
import {TypescriptFetchClientBuilder} from "../../client/typescript-fetch/typescript-fetch-client-builder"
import {ImportBuilder} from "../../common/import-builder"
import {schemaBuilderFactory} from "../../common/schema-builders/schema-builder"
import {TypeBuilder} from "../../common/type-builder"
import {TypescriptNextjsAppRouterBuilder} from "./typescript-nextjs-app-router-builder"
import {TypescriptNextjsRouterBuilder} from "./typescript-nextjs-router-builder"

function findImportAlias(dest: string, compilerOptions: CompilerOptions) {
  const relative = `./${path.relative(process.cwd(), dest)}/*`

  const alias = Object.entries(compilerOptions.paths || {}).find(([, paths]) =>
    paths.includes(relative),
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

  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  const subDirectory = process.env["OPENAPI_INTEGRATION_TESTS"]
    ? path.basename(config.input.loader.entryPointKey)
    : ""

  const appDirectory = [".", "app", subDirectory]
    .filter(isTruthy)
    .join(path.sep)
  const generatedDirectory = [".", "generated", subDirectory]
    .filter(isTruthy)
    .join(path.sep)

  const rootTypeBuilder = await TypeBuilder.fromInput(
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
  )

  const project = new Project()

  const serverRouters = (
    await Promise.all(
      input.groupedOperations("route").map(async (group) => {
        const filename = path.join(
          generatedDirectory,
          routeToNextJSFilepath(group.name),
        )

        const imports = new ImportBuilder({filename}, importAlias)

        const routerBuilder = new TypescriptNextjsRouterBuilder(
          filename,
          group.name,
          input,
          imports,
          rootTypeBuilder.withImports(imports),
          rootSchemaBuilder.withImports(imports),
        )

        const nextJsAppRouterPath = path.join(
          appDirectory,
          routeToNextJSFilepath(group.name),
        )

        const existing = fs.existsSync(
          path.join(emitter.config.destinationDirectory, nextJsAppRouterPath),
        )
          ? fs
              .readFileSync(
                path.join(
                  emitter.config.destinationDirectory,
                  nextJsAppRouterPath,
                ),
                "utf-8",
              )
              .toString()
          : ""
        const sourceFile = project.createSourceFile(
          nextJsAppRouterPath,
          existing,
        )

        const nextJSAppRouterBuilder = new TypescriptNextjsAppRouterBuilder(
          nextJsAppRouterPath,
          group.name,
          input,
          imports,
          rootTypeBuilder.withImports(imports),
          rootSchemaBuilder.withImports(imports),
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

  const clientOutputPath = [generatedDirectory, "clients", "client.ts"].join(
    path.sep,
  )
  const clientImportBuilder = new ImportBuilder(
    {filename: clientOutputPath},
    importAlias,
  )

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

function routeToNextJSFilepath(route: string): string {
  const parts = route
    .split("/")
    .map((part) => part.replaceAll("{", "[").replaceAll("}", "]"))

  parts.push("route.ts")

  return path.join(...parts)
}
