import {Input} from "../../../core/input"
import {IRModel, MaybeIRModel} from "../../../core/openapi-types-normalized"
import {OpenApiVersion, unitTestInput} from "../../../test/input.test-utils"
import {ImportBuilder} from "../import-builder"
import {formatOutput} from "../output-utils"
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
    const imports = new ImportBuilder()

    const builder = await schemaBuilderFactory(
      "./unit-test.schemas.ts",
      input,
      schemaBuilderType,
    )

    const schema = builder.withImports(imports).fromModel(maybeModel, required)

    return {
      code: (
        await formatOutput(
          `
          ${imports.toString()}

          const x = ${schema}
        `,
          "unit-test.code.ts",
        )
      ).trim(),
      schemas: (
        await formatOutput(
          builder.toCompilationUnit().getRawFileContent({
            allowUnusedImports: false,
            includeHeader: false,
          }),
          "unit-test.schemas.ts",
        )
      ).trim(),
    }
  }

  return {
    getActualFromModel,
    getActual,
  }
}
