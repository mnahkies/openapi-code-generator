import {OpenapiGeneratorConfig} from "../../templates.types"
import {ImportBuilder} from "../common/import-builder"
import {emitGenerationResult} from "../common/output-utils"
import {schemaBuilderFactory} from "../common/schema-builders/schema-builder"
import {TypeBuilder} from "../common/type-builder"
import {TypescriptFetchClientBuilder} from "./typescript-fetch-client-builder"

export async function generateTypescriptFetch(
  config: OpenapiGeneratorConfig,
): Promise<void> {
  const input = config.input

  const rootTypeBuilder = await TypeBuilder.fromInput("./models.ts", input, {
    ...config.compilerOptions,
    exactOptionalPropertyTypes: false,
  })
  const rootSchemaBuilder = await schemaBuilderFactory(
    "./schemas.ts",
    input,
    config.schemaBuilder,
  )

  const imports = new ImportBuilder()

  const client = new TypescriptFetchClientBuilder(
    "client.ts",
    "ApiClient",
    input,
    imports,
    rootTypeBuilder.withImports(imports),
    rootSchemaBuilder.withImports(imports),
    {
      enableRuntimeResponseValidation: config.enableRuntimeResponseValidation,
      allowUnusedImports: config.allowUnusedImports,
    },
  )

  input.allOperations().map((it) => client.add(it))

  await emitGenerationResult(config.dest, [
    rootTypeBuilder,
    client,
    rootSchemaBuilder,
  ])
}
