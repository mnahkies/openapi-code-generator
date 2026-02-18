import ts from "typescript"
import type {ISchemaProvider} from "../../../core/input"
import type {IFormatter} from "../../../core/interfaces"
import type {CompilerOptions} from "../../../core/loaders/tsconfig.loader"
import type {MaybeIRModel} from "../../../core/openapi-types-normalized"
import {
  type OpenApiVersion,
  unitTestInput,
} from "../../../test/input.test-utils"
import {ImportBuilder} from "../import-builder"
import {TypeBuilder, type TypeBuilderConfig} from "../type-builder/type-builder"
import type {SchemaBuilderConfig} from "./abstract-schema-builder"
import {type SchemaBuilderType, schemaBuilderFactory} from "./schema-builder"

export type SchemaBuilderIntegrationTestHarness = {
  getActual(
    path: string,
    config?: SchemaBuilderConfig,
  ): Promise<{
    code: string
    schemas: string
    execute: (input: unknown) => Promise<unknown>
  }>
}

export function schemaBuilderIntegrationTestHarness(
  schemaBuilderType: SchemaBuilderType,
  formatter: IFormatter,
  version: OpenApiVersion,
  executeParseSchema: (code: string, input?: unknown) => Promise<unknown>,
) {
  const innerHarness = schemaBuilderTestHarness(
    schemaBuilderType,
    formatter,
    executeParseSchema,
  )

  async function getActual(
    path: string,
    config: SchemaBuilderConfig = {allowAny: false},
  ) {
    const {input, file} = await unitTestInput(version)

    return innerHarness.getActual(
      {$ref: `${file}#${path}`},
      input,
      {
        config: {allowAny: config.allowAny},
        compilerOptions: {exactOptionalPropertyTypes: false},
      },
      true,
    )
  }

  return {
    getActual,
  }
}

export type SchemaBuilderTestHarness = {
  getActual(
    maybeIRModel: MaybeIRModel,
    schemaProvider: ISchemaProvider,
    opts?: {
      config?: TypeBuilderConfig
      compilerOptions?: CompilerOptions
    },
    required?: boolean,
  ): Promise<{
    code: string
    schemas: string
    execute: (input: unknown) => Promise<unknown>
  }>
}

export function schemaBuilderTestHarness(
  schemaBuilderType: SchemaBuilderType,
  formatter: IFormatter,
  executeParseSchema: (code: string, input?: unknown) => Promise<unknown>,
): SchemaBuilderTestHarness {
  async function getActual(
    maybeIRModel: MaybeIRModel,
    schemaProvider: ISchemaProvider,
    {
      config = {allowAny: false},
      compilerOptions = {exactOptionalPropertyTypes: false},
    }: {
      config?: TypeBuilderConfig
      compilerOptions?: CompilerOptions
    },
    required: boolean = true,
  ) {
    const imports = new ImportBuilder({includeFileExtensions: false})

    const typeBuilder = await TypeBuilder.fromSchemaProvider(
      "./unit-test.types.ts",
      schemaProvider,
      compilerOptions,
      config,
    )

    const schemaBuilder = (
      await schemaBuilderFactory(
        "./unit-test.schemas.ts",
        schemaProvider,
        schemaBuilderType,
        config,
        new ImportBuilder({includeFileExtensions: false}),
        typeBuilder,
      )
    ).withImports(imports)

    const schema = schemaBuilder.fromModel(maybeIRModel, required)

    const code = (
      await formatter.format(
        "unit-test.code.ts",
        `
          ${imports.toString()}

          ${
            // hack: joi currently shoves exported functions into schemas.ts for intersection support, and
            //       executing the code during tests we don't have module.exports available.
            schemaBuilder.preamble().replaceAll("export function", "function")
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

  return {getActual}
}
