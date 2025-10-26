import path from "node:path"
import {normalizeFilename} from "../../../core/utils"
import type {OpenapiTypescriptGeneratorConfig} from "../../../templates.types"
import {CompilationUnit} from "../../common/compilation-units"
import {ImportBuilder} from "../../common/import-builder"
import {schemaBuilderFactory} from "../../common/schema-builders/schema-builder"
import {TypeBuilder} from "../../common/type-builder"
import {KoaRouterBuilder} from "./typescript-koa-router-builder"
import {KoaServerBuilder} from "./typescript-koa-server-builder"

export async function generateTypescriptKoa(
  config: OpenapiTypescriptGeneratorConfig,
): Promise<void> {
  const {input, emitter, allowAny} = config

  const routesDirectory =
    config.groupingStrategy === "none" ? "./" : "./routes/"

  const importBuilderConfig = {includeFileExtensions: config.isEsmProject}

  const schemaBuilderImports = new ImportBuilder(importBuilderConfig)

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
    schemaBuilderImports,
    rootTypeBuilder,
  )

  const server = new KoaServerBuilder(
    "index.ts",
    input.name(),
    input,
    new ImportBuilder(importBuilderConfig),
  )

  const routers = await Promise.all(
    input.groupedOperations(config.groupingStrategy).map(async (group) => {
      const filename = normalizeFilename(
        `${path.join(routesDirectory, group.name)}.ts`,
        config.filenameConvention,
      )
      const imports = new ImportBuilder({
        ...importBuilderConfig,
        unit: {
          filename,
        },
      })

      const routerBuilder = new KoaRouterBuilder(
        filename,
        group.name,
        input,
        imports,
        rootTypeBuilder.withImports(imports),
        rootSchemaBuilder.withImports(imports),
        config.serverImplementationMethod,
      )

      for (const it of group.operations) {
        routerBuilder.add(it)
      }

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
