import {OpenapiGeneratorConfig} from "../../templates.types"
import {ImportBuilder} from "../common/import-builder"
import {emitGenerationResult} from "../common/output-utils"
import {schemaBuilderFactory} from "../common/schema-builders/schema-builder"
import {TypeBuilder} from "../common/type-builder"
import {TypescriptAxiosClientBuilder} from "./typescript-axios-client-builder"

export async function generateTypescriptAxios(
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

  const client = new TypescriptAxiosClientBuilder(
    "client.ts",
    "ApiClient",
    input,
    imports,
    types,
    schemaBuilder,
    {
      enableRuntimeResponseValidation: config.enableRuntimeResponseValidation,
      allowUnusedImports: config.allowUnusedImports,
    },
  )

  input.allOperations().map((it) => client.add(it))

  await emitGenerationResult(config.dest, [types, client, schemaBuilder])
}
