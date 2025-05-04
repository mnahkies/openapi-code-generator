// biome-ignore lint/style/useNodejsImportProtocol: keep webpack happy
import path from "path"
import {normalizeFilename} from "../../../core/utils"
import type {OpenapiTypescriptGeneratorConfig} from "../../../templates.types"
import {CompilationUnit} from "../../common/compilation-units"
import {ImportBuilder} from "../../common/import-builder"
import type {SchemaBuilderType} from "../../common/schema-builders/schema-builder"
import {schemaBuilderFactory} from "../../common/schema-builders/schema-builder"
import {TypeBuilder} from "../../common/type-builder"
import {ExpressRouterBuilder} from "./typescript-express-router-builder"
import {ExpressServerBuilder} from "./typescript-express-server-builder"

export async function generateTypescriptExpress(
  config: OpenapiTypescriptGeneratorConfig,
): Promise<void> {
  const {input, emitter, allowAny} = config

  const routesDirectory =
    config.groupingStrategy === "none" ? "./" : "./routes/"

  const rootTypeBuilder = await TypeBuilder.fromInput(
    "./models.ts",
    input,
    config.compilerOptions,
    {allowAny},
  )

  const rootSchemaBuilder = await schemaBuilderFactory(
    "./schemas.ts",
    input,
    config.schemaBuilder,
    {allowAny},
  )

  const server = new ExpressServerBuilder(
    "index.ts",
    input.name(),
    input,
    new ImportBuilder(),
  )

  const routers = await Promise.all(
    input.groupedOperations(config.groupingStrategy).map(async (group) => {
      const filename = normalizeFilename(
        `${path.join(routesDirectory, group.name)}.ts`,
        config.filenameConvention,
      )
      const imports = new ImportBuilder({filename})

      // Create router with imports and types
      const routerBuilder = new ExpressRouterBuilder(
        filename,
        group.name,
        input,
        imports,
        rootTypeBuilder.withImports(imports),
        rootSchemaBuilder.withImports(imports),
        config.serverImplementationMethod,
      )

      // biome-ignore lint/complexity/noForEach: <explanation>
      group.operations.forEach((it) => routerBuilder.add(it))
      return routerBuilder.toCompilationUnit()
    }),
  )

  if (config.groupingStrategy === "none") {
    await emitter.emitGenerationResult([
      CompilationUnit.merge(
        "./generated.ts",
        ...routers,
        server.toCompilationUnit(),
      ),
      rootTypeBuilder.toCompilationUnit(),
      rootSchemaBuilder.toCompilationUnit(),
    ])
  } else {
    await emitter.emitGenerationResult([
      server.toCompilationUnit(),
      ...routers,
      rootTypeBuilder.toCompilationUnit(),
      rootSchemaBuilder.toCompilationUnit(),
    ])
  }
}
