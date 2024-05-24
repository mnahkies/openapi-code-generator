import {Input} from "../../../core/input"
import {IRModel, MaybeIRModel} from "../../../core/openapi-types-normalized"
import {OpenApiVersion, unitTestInput} from "../../../test/input.test-utils"
import {ImportBuilder} from "../import-builder"
import {TypescriptFormatter} from "../typescript-formatter"
import {SchemaBuilderType, schemaBuilderFactory} from "./schema-builder"

export function schemaBuilderTestHarness(
  schemaBuilderType: SchemaBuilderType,
  version: OpenApiVersion,
) {
  async function getActualFromModel(model: IRModel) {
    const {input} = await unitTestInput(version)
    return getResult(input, model, true)
  }

  async function getActual(path: string) {
    const {input, file} = await unitTestInput(version)
    return getResult(input, {$ref: `${file}#${path}`}, true)
  }

  async function getResult(
    input: Input,
    maybeModel: MaybeIRModel,
    required: boolean,
  ) {
    const formatter = await TypescriptFormatter.createNodeFormatter()

    const imports = new ImportBuilder()

    const builder = await schemaBuilderFactory(
      "./unit-test.schemas.ts",
      input,
      schemaBuilderType,
      {allowAny: true},
    )

    const schema = builder.withImports(imports).fromModel(maybeModel, required)

    return {
      code: (
        await formatter.format(
          "unit-test.code.ts",
          `
          ${imports.toString()}

          const x = ${schema}
        `,
        )
      ).trim(),
      schemas: (
        await formatter.format(
          "unit-test.schemas.ts",
          builder.toCompilationUnit().getRawFileContent({
            allowUnusedImports: false,
            includeHeader: false,
          }),
        )
      ).trim(),
    }
  }

  return {
    getActualFromModel,
    getActual,
  }
}
