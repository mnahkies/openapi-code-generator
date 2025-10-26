import {titleCase} from "../../../core/utils"
import type {OpenapiTypescriptGeneratorConfig} from "../../../templates.types"
import {ImportBuilder} from "../../common/import-builder"
import {schemaBuilderFactory} from "../../common/schema-builders/schema-builder"
import {TypeBuilder} from "../../common/type-builder"
import {TypescriptAxiosClientBuilder} from "./typescript-axios-client-builder"

export async function generateTypescriptAxios(
  config: OpenapiTypescriptGeneratorConfig,
): Promise<void> {
  const {input, emitter, allowAny} = config

  const importBuilderConfig = {includeFileExtensions: config.isEsmProject}

  const schemaBuilderImports = new ImportBuilder(importBuilderConfig)
  const clientImports = new ImportBuilder(importBuilderConfig)

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

  const filename = "client.ts"
  const exportName = titleCase(input.name())

  const client = new TypescriptAxiosClientBuilder(
    filename,
    exportName,
    input,
    clientImports,
    rootTypeBuilder.withImports(clientImports),
    rootSchemaBuilder.withImports(clientImports),
    {
      enableRuntimeResponseValidation: config.enableRuntimeResponseValidation,
      enableTypedBasePaths: config.enableTypedBasePaths,
    },
  )

  input.allOperations().map((it) => client.add(it))

  await emitter.emitGenerationResult([
    client.toCompilationUnit(),
    rootTypeBuilder.toCompilationUnit(),
    rootSchemaBuilder.toCompilationUnit(),
  ])
}
