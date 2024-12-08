import {titleCase} from "../../core/utils"
import type {OpenapiTypescriptGeneratorConfig} from "../../templates.types"
import {ImportBuilder} from "../common/import-builder"
import {schemaBuilderFactory} from "../common/schema-builders/schema-builder"
import {TypeBuilder} from "../common/type-builder"
import {TypescriptFetchClientBuilder} from "./typescript-fetch-client-builder"

export async function generateTypescriptFetch(
  config: OpenapiTypescriptGeneratorConfig,
): Promise<void> {
  const {input, emitter, allowAny} = config

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

  const imports = new ImportBuilder()

  const filename = "client.ts"
  const exportName = titleCase(input.name())

  const client = new TypescriptFetchClientBuilder(
    filename,
    exportName,
    input,
    imports,
    rootTypeBuilder.withImports(imports),
    rootSchemaBuilder.withImports(imports),
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
