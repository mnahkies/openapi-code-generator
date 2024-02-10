/**
 * @prettier
 */
import {TypeBuilder} from "../common/type-builder"
import {emitGenerationResult} from "../common/output-utils"
import {AngularModuleBuilder} from "./angular-module-builder"
import {AngularServiceBuilder} from "./angular-service-builder"
import {OpenapiGeneratorConfig} from "../../templates.types"
import {ImportBuilder} from "../common/import-builder"
import {schemaBuilderFactory} from "../common/schema-builders/schema-builder"

export async function generateTypescriptAngular(
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

  const client = new AngularServiceBuilder(
    "client.service.ts",
    "ApiClient",
    input,
    imports,
    types,
    schemaBuilder,
    config.enableRuntimeResponseValidation,
  )

  input.allOperations().map((it) => client.add(it))

  const module = new AngularModuleBuilder("api.module.ts", "Api")

  module.provides("./" + client.filename).add(client.name)

  await emitGenerationResult(config.dest, [
    types,
    client,
    module,
    schemaBuilder,
  ])
}
