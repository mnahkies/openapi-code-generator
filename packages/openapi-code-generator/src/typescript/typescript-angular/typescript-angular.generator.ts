import type {OpenapiTypescriptGeneratorConfig} from "../../templates.types"
import {ImportBuilder} from "../common/import-builder"
import {schemaBuilderFactory} from "../common/schema-builders/schema-builder"
import {TypeBuilder} from "../common/type-builder"
import {AngularModuleBuilder} from "./angular-module-builder"
import {AngularServiceBuilder} from "./angular-service-builder"

export async function generateTypescriptAngular(
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

  const client = new AngularServiceBuilder(
    "client.service.ts",
    "ApiClient",
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

  const module = new AngularModuleBuilder("api.module.ts", "Api")

  module.provides(`./${client.filename}`).add(client.name)

  await emitter.emitGenerationResult([
    module.toCompilationUnit(),
    client.toCompilationUnit(),
    rootTypeBuilder.toCompilationUnit(),
    rootSchemaBuilder.toCompilationUnit(),
  ])
}
