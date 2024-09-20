import type {Input} from "../../../core/input"
import type {
  IRModel,
  MaybeIRModel,
} from "../../../core/openapi-types-normalized"
import {
  type OpenApiVersion,
  unitTestInput,
} from "../../../test/input.test-utils"
import {ImportBuilder} from "../import-builder"
import {TypescriptFormatterBiome} from "../typescript-formatter.biome"
import type {SchemaBuilderConfig} from "./abstract-schema-builder"
import {type SchemaBuilderType, schemaBuilderFactory} from "./schema-builder"

export function schemaBuilderTestHarness(
  schemaBuilderType: SchemaBuilderType,
  version: OpenApiVersion,
  executeParseSchema: (code: string, input?: unknown) => Promise<unknown>,
) {
  async function getActualFromModel(
    model: IRModel,
    config: SchemaBuilderConfig = {allowAny: false},
  ) {
    const {input} = await unitTestInput(version)
    return getResult(input, model, true, config)
  }

  async function getActual(
    path: string,
    config: SchemaBuilderConfig = {allowAny: false},
  ) {
    const {input, file} = await unitTestInput(version)
    return getResult(input, {$ref: `${file}#${path}`}, true, config)
  }

  async function getResult(
    input: Input,
    maybeModel: MaybeIRModel,
    required: boolean,
    config: SchemaBuilderConfig,
  ) {
    const formatter = await TypescriptFormatterBiome.createNodeFormatter()

    const imports = new ImportBuilder()

    const schemaBuilder = await schemaBuilderFactory(
      "./unit-test.schemas.ts",
      input,
      schemaBuilderType,
      config,
    )

    const schema = schemaBuilder
      .withImports(imports)
      .fromModel(maybeModel, required)

    const code = (
      await formatter.format(
        "unit-test.code.ts",
        `
          ${imports.toString()}

          const x = ${schema}
        `,
      )
    ).trim()

    const schemas = (
      await formatter.format(
        "unit-test.schemas.ts",
        schemaBuilder.toCompilationUnit().getRawFileContent({
          allowUnusedImports: false,
          includeHeader: false,
        }),
      )
    ).trim()

    return {
      code,
      schemas,
      execute: (input: unknown) => {
        return executeParseSchema(`
        (async function () {
        ${code}
        return ${schemaBuilder.parse("x", JSON.stringify(input))}
        })()
        `)
      },
    }
  }

  return {
    getActualFromModel,
    getActual,
  }
}
