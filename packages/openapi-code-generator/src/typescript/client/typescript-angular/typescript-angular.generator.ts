import {titleCase} from "../../../core/utils"
import type {OpenapiTypescriptGeneratorConfig} from "../../../templates.types"
import {ImportBuilder} from "../../common/import-builder"
import {schemaBuilderFactory} from "../../common/schema-builders/schema-builder"
import {TypeBuilder} from "../../common/type-builder"
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

  const exportName = titleCase(input.name())
  const serviceExportName = `${exportName}Service`
  const moduleExportName = `${exportName}Module`

  const client = new AngularServiceBuilder(
    "client.service.ts",
    serviceExportName,
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

  const module = new AngularModuleBuilder("api.module.ts", moduleExportName)

  module.provides(`./${client.filename}`).add(client.exportName)

  await emitter.emitGenerationResult([
    module.toCompilationUnit(),
    client.toCompilationUnit(),
    rootTypeBuilder.toCompilationUnit(),
    rootSchemaBuilder.toCompilationUnit(),
  ])
}
