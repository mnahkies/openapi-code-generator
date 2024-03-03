import {OpenapiGeneratorConfig} from "../../templates.types"
import {ImportBuilder} from "../common/import-builder"
import {emitGenerationResult} from "../common/output-utils"
import {schemaBuilderFactory} from "../common/schema-builders/schema-builder"
import {TypeBuilder} from "../common/type-builder"
import {AngularModuleBuilder} from "./angular-module-builder"
import {AngularServiceBuilder} from "./angular-service-builder"

export async function generateTypescriptAngular(
  config: OpenapiGeneratorConfig,
): Promise<void> {
  const input = config.input

  const rootTypeBuilder = await TypeBuilder.fromInput(
    "./models.ts",
    input,
    config.compilerOptions,
  )
  const rootSchemaBuilder = await schemaBuilderFactory(
    "./schemas.ts",
    input,
    config.schemaBuilder,
  )

  const imports = new ImportBuilder()

  const client = new AngularServiceBuilder(
    "client.service.ts",
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

  const module = new AngularModuleBuilder("api.module.ts", "Api")

  module.provides("./" + client.filename).add(client.name)

  await emitGenerationResult(
    config.dest,
    [
      module.toCompilationUnit(),
      client.toCompilationUnit(),
      rootTypeBuilder.toCompilationUnit(),
      rootSchemaBuilder.toCompilationUnit(),
    ],
    {allowUnusedImports: config.allowUnusedImports},
  )
}
