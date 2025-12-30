import type {ISchemaProvider} from "../../../core/input"
import type {IFormatter} from "../../../core/interfaces"
import type {CompilerOptions} from "../../../core/loaders/tsconfig.loader"
import type {MaybeIRModel} from "../../../core/openapi-types-normalized"
import {TestOutputTypeChecker} from "../../../test/typescript-compiler.test-utils"
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
  const typechecker = new TestOutputTypeChecker()

  async function getActual(
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

    typechecker.typecheck([
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
    const raw = unit.getRawFileContent({
      allowUnusedImports: false,
      includeHeader: false,
    })

    return {
      filename: unit.filename,
      content: (await formatter.format(unit.filename, raw)).result.trim(),
    }
  }

  return {getActual}
}
