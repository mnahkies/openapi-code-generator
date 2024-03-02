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
  const imports = new ImportBuilder()
  const types = TypeBuilder.fromInput("./models.ts", input, {
    ...config.compilerOptions,
    exactOptionalPropertyTypes: false,
  }).withImports(imports)
  const schemaBuilder = schemaBuilderFactory(
    config.schemaBuilder,
    input,
    imports,
  )

  const client = new TypescriptFetchClientBuilder(
    "client.ts",
    "ApiClient",
    input,
    imports,
    types,
    schemaBuilder,
    config.enableRuntimeResponseValidation,
  )

  input.allOperations().map((it) => client.add(it))

  await emitGenerationResult(config.dest, [types, client, schemaBuilder])
}
