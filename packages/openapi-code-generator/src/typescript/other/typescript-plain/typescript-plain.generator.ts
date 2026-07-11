import path from "node:path"
import type {OpenapiTypescriptGeneratorConfig} from "../../../templates.types.ts"
import {CompilationUnit} from "../../common/compilation-units.ts"
import {ImportBuilder} from "../../common/import-builder.ts"
import {schemaBuilderFactory} from "../../common/schema-builders/schema-builder.ts"
import {TypeBuilder} from "../../common/type-builder/type-builder.ts"

export async function generateTypescriptPlainSchema(
  config: OpenapiTypescriptGeneratorConfig,
): Promise<void> {
  const {input, emitter, allowAny} = config
  const importBuilderConfig = {includeFileExtensions: config.isEsmProject}

  const units: CompilationUnit[] = []
  const documents = input.allJsonSchemaDocuments()

  const fileNameForSchema = (filename: string) => {
    return `./${path.basename(filename, path.extname(filename))}.ts`
  }

  for (const document of documents) {
    const filename = fileNameForSchema(document.filename)

    const imports = new ImportBuilder({
      ...importBuilderConfig,
      unit: {filename},
    })

    const typeBuilder = (
      await TypeBuilder.fromSchemaProvider(
        filename,
        input,
        config.compilerOptions,
        {allowAny, refToFilename: fileNameForSchema},
      )
    ).withImports(imports)

    const schemaBuilder = (
      await schemaBuilderFactory(
        filename,
        input,
        config.schemaBuilder,
        {allowAny, refToFilename: fileNameForSchema},
        imports,
        typeBuilder,
      )
    ).withImports(imports)

    const ref = {
      $ref: `${path.basename(document.filename)}`,
    }

    // reference the schema so it's included in the type builder compilation unit
    void typeBuilder.schemaObjectToType(ref)
    // reference the schema so it's included in the schema builder compilation unit
    void schemaBuilder.fromModel(ref, true)

    const unit = CompilationUnit.merge(
      filename,
      typeBuilder.toCompilationUnit(),
      schemaBuilder.toCompilationUnit(),
    )

    units.push(unit)
  }

  await emitter.emitGenerationResult(units)
}
