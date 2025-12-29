import ts from "typescript"
import type {Input, SchemaNormalizer} from "../../../core/input"
import type {
  Reference,
  Schema,
  SchemaNumber,
  SchemaObject,
  SchemaString,
} from "../../../core/openapi-types"
import {isRef} from "../../../core/openapi-utils"
import {
  type OpenApiVersion,
  unitTestInput,
} from "../../../test/input.test-utils"
import {ImportBuilder} from "../import-builder"
import {TypeBuilder} from "../type-builder"
import {TypescriptFormatterBiome} from "../typescript-formatter.biome"
import type {SchemaBuilderConfig} from "./abstract-schema-builder"
import {type SchemaBuilderType, schemaBuilderFactory} from "./schema-builder"

export function schemaBuilderTestHarness(
  schemaBuilderType: SchemaBuilderType,
  version: OpenApiVersion,
  executeParseSchema: (code: string, input?: unknown) => Promise<unknown>,
) {
  async function getActualFromModel(
    schema: Schema,
    config: SchemaBuilderConfig = {allowAny: false},
  ) {
    const {input, schemaNormalizer} = await unitTestInput(version)
    return getResult(input, schemaNormalizer, schema, true, config)
  }

  async function getActual(
    path: string,
    config: SchemaBuilderConfig = {allowAny: false},
  ) {
    const {input, schemaNormalizer, file} = await unitTestInput(version)
    return getResult(
      input,
      schemaNormalizer,
      {$ref: `${file}#${path}`},
      true,
      config,
    )
  }

  async function getResult(
    input: Input,
    schemaNormalizer: SchemaNormalizer,
    maybeSchema: Schema | Reference,
    required: boolean,
    config: SchemaBuilderConfig,
  ) {
    const formatter = await TypescriptFormatterBiome.createNodeFormatter()

    const imports = new ImportBuilder({includeFileExtensions: false})

    const typeBuilder = await TypeBuilder.fromInput(
      "./unit-test.types.ts",
      input,
      {exactOptionalPropertyTypes: false},
      {allowAny: config.allowAny},
    )

    const schemaBuilder = (
      await schemaBuilderFactory(
        "./unit-test.schemas.ts",
        input,
        schemaBuilderType,
        config,
        new ImportBuilder({includeFileExtensions: false}),
        typeBuilder,
      )
    ).withImports(imports)

    const schema = schemaBuilder.fromModel(
      isRef(maybeSchema)
        ? maybeSchema
        : schemaNormalizer.normalize(maybeSchema),
      required,
    )

    const code = (
      await formatter.format(
        "unit-test.code.ts",
        `
          ${imports.toString()}

          ${
            // hack: joi currently shoves exported functions into schemas.ts for intersection support, and
            //       executing the code during tests we don't have module.exports available.
            schemaBuilder
              .preamble()
              .replaceAll("export function", "function")
          }const x = ${schema}
        `,
      )
    ).result.trim()

    const schemas = (
      await formatter.format(
        "unit-test.schemas.ts",
        schemaBuilder.toCompilationUnit().getRawFileContent({
          allowUnusedImports: false,
          includeHeader: false,
        }),
      )
    ).result.trim()

    return {
      code,
      schemas,
      execute: (input: unknown) => {
        const wrappedCode = `
        (async function () {
        ${code}
        return ${schemaBuilder.parse("x", JSON.stringify(input))}
        })()
        `

        // note: transpileModule won't raise any diagnostics for invalid types,
        //       just transpiles to js
        const transpiledCode = ts.transpileModule(wrappedCode, {
          compilerOptions: {module: ts.ModuleKind.CommonJS},
        }).outputText

        return executeParseSchema(transpiledCode)
      },
    }
  }

  return {
    getActualFromModel,
    getActual,
  }
}

export function schemaObject(
  partial: Partial<SchemaObject> = {},
): SchemaObject {
  return {
    type: "object",
    allOf: [],
    anyOf: [],
    oneOf: [],
    properties: {},
    additionalProperties: undefined,
    required: [],
    nullable: false,
    readOnly: false,
    ...partial,
  }
}

export function schemaString(
  partial: Partial<SchemaString> = {},
): SchemaString {
  return {
    type: "string",
    nullable: false,
    readOnly: false,
    ...partial,
  }
}

export function schemaNumber(
  partial: Partial<SchemaNumber> = {},
): SchemaNumber {
  return {
    type: "number",
    nullable: false,
    readOnly: false,
    ...partial,
  }
}
