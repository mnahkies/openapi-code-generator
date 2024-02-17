import {TypescriptFetchClientBuilder} from "./typescript-fetch-client-builder"
import {ImportBuilder} from "../common/import-builder"
import {TypeBuilder} from "../common/type-builder"
import {schemaBuilderFactory} from "../common/schema-builders/schema-builder"
import {OpenapiGeneratorConfig} from "../../templates.types"
import {emitGenerationResult} from "../common/output-utils"

export async function generateTypescriptFetch(
  config: OpenapiGeneratorConfig,
): Promise<void> {
  const input = config.input
  const imports = new ImportBuilder()
  const types = TypeBuilder.fromInput("./models.ts", input).withImports(imports)
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
