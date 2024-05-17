import {OpenapiGeneratorConfig} from "../../templates.types"
import {ImportBuilder} from "../common/import-builder"
import {schemaBuilderFactory} from "../common/schema-builders/schema-builder"
import {TypeBuilder} from "../common/type-builder"
import {TypescriptFetchClientBuilder} from "./typescript-fetch-client-builder"

export async function generateTypescriptFetch(
  config: OpenapiGeneratorConfig,
): Promise<void> {
  const {input, emitter} = config

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
    },
  )

  input.allOperations().map((it) => client.add(it))

  await emitter.emitGenerationResult([
    client.toCompilationUnit(),
    rootTypeBuilder.toCompilationUnit(),
    rootSchemaBuilder.toCompilationUnit(),
  ])
}
