import type {ISchemaProvider} from "../../../core/input"
import type {IFormatter} from "../../../core/interfaces"
import type {CompilerOptions} from "../../../core/loaders/tsconfig.loader"
import type {MaybeIRModel} from "../../../core/openapi-types-normalized"
import typecheck from "../../../test/typescript-compiler-worker.test-utils"
import {CompilationUnit} from "../compilation-units"
import {ImportBuilder} from "../import-builder"
import {TypeBuilder, type TypeBuilderConfig} from "./type-builder"

export type TypeBuilderTestHarness = {
  getActual: (
    schema: MaybeIRModel,
    schemaProvider: ISchemaProvider,
    config: {
      config?: TypeBuilderConfig
      compilerOptions?: CompilerOptions
    },
  ) => Promise<{code: string; types: string}>
}

export function typeBuilderTestHarness(
  formatter: IFormatter,
): TypeBuilderTestHarness {
  async function getResult(
    schema: MaybeIRModel,
    input: ISchemaProvider,
    {
      config = {allowAny: false},
      compilerOptions = {exactOptionalPropertyTypes: false},
    }: {
      config?: TypeBuilderConfig
      compilerOptions?: CompilerOptions
    },
  ) {
    const imports = new ImportBuilder({includeFileExtensions: false})

    const builder = await TypeBuilder.fromSchemaProvider(
      "./unit-test.types.ts",
      input,
      compilerOptions,
      config,
    )

    const type = builder.withImports(imports).schemaObjectToType(schema)

    const usage = await formatted(
      formatter,
      new CompilationUnit(
        "./unit-test.code.ts",
        imports,
        `declare const x: ${type}`,
      ),
    )

    const types = await formatted(formatter, builder.toCompilationUnit())

    await typecheck([
      {
        filename: usage.filename,
        content: usage.content,
      },
      {
        filename: types.filename,
        content: types.content,
      },
    ])

    return {
      code: usage.content,
      types: types.content,
    }
  }

  async function formatted(
    formatter: IFormatter,
    unit: CompilationUnit,
  ): Promise<{
    filename: string
    content: string
  }> {
    return {
      filename: unit.filename,
      content: (
        await formatter.format(
          unit.filename,
          unit.getRawFileContent({
            allowUnusedImports: false,
            includeHeader: false,
          }),
        )
      ).result.trim(),
    }
  }

  return {getActual: getResult}
}
