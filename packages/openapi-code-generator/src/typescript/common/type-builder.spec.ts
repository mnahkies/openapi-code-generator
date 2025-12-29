import {describe, expect, it} from "@jest/globals"
import type {Input} from "../../core/input"
import type {CompilerOptions} from "../../core/loaders/tsconfig.loader"
import type {IRModel, MaybeIRModel} from "../../core/openapi-types-normalized"
import {testVersions, unitTestInput} from "../../test/input.test-utils"
import {irFixture as ir} from "../../test/ir-model.fixtures.test-utils"
import typecheck from "../../test/typescript-compiler-worker.test-utils"
import {CompilationUnit} from "./compilation-units"
import {ImportBuilder} from "./import-builder"
import {TypeBuilder, type TypeBuilderConfig} from "./type-builder"
import {TypescriptFormatterBiome} from "./typescript-formatter.biome"

describe.each(
  testVersions,
)("%s - typescript/common/type-builder", (version) => {
  it("can build a type for a simple object correctly", async () => {
    const {code, types} = await getActual("components/schemas/SimpleObject")

    expect(code).toMatchInlineSnapshot(`
        "import type { t_SimpleObject } from "./unit-test.types"

        declare const x: t_SimpleObject"
      `)

    expect(types).toMatchInlineSnapshot(`
        "export type t_SimpleObject = {
          $ref?: string
          date: string
          datetime: string
          num: number
          optional_str?: string
          required_nullable: string | null
          str: string
        }"
      `)
  })

  it("can build an optional property compatible with 'exactOptionalPropertyTypes'", async () => {
    const {code, types} = await getActual(
      "components/schemas/OptionalProperties",
      {
        compilerOptions: {
          exactOptionalPropertyTypes: true,
        },
      },
    )

    expect(code).toMatchInlineSnapshot(`
        "import type { t_OptionalProperties } from "./unit-test.types"

        declare const x: t_OptionalProperties"
      `)

    expect(types).toMatchInlineSnapshot(`
        "export type t_OptionalProperties = {
          optional_str?: string | undefined
        }"
      `)
  })

  it("can build a type for an object that references other objects correctly", async () => {
    const {code, types} = await getActual("components/schemas/ObjectWithRefs")

    expect(code).toMatchInlineSnapshot(`
        "import type { t_ObjectWithRefs } from "./unit-test.types"

        declare const x: t_ObjectWithRefs"
      `)

    expect(types).toMatchInlineSnapshot(`
        "export type t_ObjectWithRefs = {
          optionalObject?: t_SimpleObject
          requiredObject: t_SimpleObject
        }

        export type t_SimpleObject = {
          $ref?: string
          date: string
          datetime: string
          num: number
          optional_str?: string
          required_nullable: string | null
          str: string
        }"
      `)
  })

  it("can build a type for a named nullable string enum", async () => {
    const {code, types} = await getActual(
      "components/schemas/NamedNullableStringEnum",
    )

    expect(code).toMatchInlineSnapshot(`
        "import type { t_NamedNullableStringEnum } from "./unit-test.types"

        declare const x: t_NamedNullableStringEnum"
      `)

    expect(types).toMatchInlineSnapshot(
      '"export type t_NamedNullableStringEnum = "" | "one" | "two" | "three" | null"',
    )
  })

  it("can build a type for a oneOf correctly", async () => {
    const {code, types} = await getActual("components/schemas/OneOf")

    expect(code).toMatchInlineSnapshot(`
        "import type { t_OneOf } from "./unit-test.types"

        declare const x: t_OneOf"
      `)

    expect(types).toMatchInlineSnapshot(`
        "export type t_OneOf =
          | {
              strs: string[]
            }
          | string[]
          | string"
      `)
  })

  it("can build a type for a anyOf correctly", async () => {
    const {code, types} = await getActual("components/schemas/AnyOf")

    expect(code).toMatchInlineSnapshot(`
        "import type { t_AnyOf } from "./unit-test.types"

        declare const x: t_AnyOf"
      `)

    expect(types).toMatchInlineSnapshot(
      '"export type t_AnyOf = number | string"',
    )
  })

  it("can build a type for a nullable string using anyOf correctly", async () => {
    const {code, types} = await getActual(
      "components/schemas/AnyOfNullableString",
    )

    expect(code).toMatchInlineSnapshot(`
        "import type { t_AnyOfNullableString } from "./unit-test.types"

        declare const x: t_AnyOfNullableString"
      `)

    expect(types).toMatchInlineSnapshot(
      '"export type t_AnyOfNullableString = string | null"',
    )
  })

  it("can build a type for a allOf correctly", async () => {
    const {code, types} = await getActual("components/schemas/AllOf")

    expect(code).toMatchInlineSnapshot(`
        "import type { t_AllOf } from "./unit-test.types"

        declare const x: t_AllOf"
      `)

    expect(types).toMatchInlineSnapshot(`
        "export type t_AllOf = t_Base & {
          id: number
        }

        export type t_Base = {
          breed?: string
          name: string
        }"
      `)
  })

  it("can build a recursive type correctly", async () => {
    const {code, types} = await getActual("components/schemas/Recursive")

    expect(code).toMatchInlineSnapshot(`
        "import type { t_Recursive } from "./unit-test.types"

        declare const x: t_Recursive"
      `)

    expect(types).toMatchInlineSnapshot(`
        "export type t_Recursive = {
          child?: t_Recursive
        }"
      `)
  })

  it("handles additionalProperties specifying a schema", async () => {
    const {code, types} = await getActual(
      "components/schemas/AdditionalPropertiesSchema",
    )

    expect(code).toMatchInlineSnapshot(`
        "import type { t_AdditionalPropertiesSchema } from "./unit-test.types"

        declare const x: t_AdditionalPropertiesSchema"
      `)

    expect(types).toMatchInlineSnapshot(`
        "export type t_AdditionalPropertiesSchema = Record<
          string,
          t_NamedNullableStringEnum
        >

        export type t_NamedNullableStringEnum = "" | "one" | "two" | "three" | null"
      `)
  })

  describe("unspecified schemas when allowAny: true", () => {
    it("handles additionalProperties set to true", async () => {
      const {code, types} = await getActual(
        "components/schemas/AdditionalPropertiesBool",
        {config: {allowAny: true}},
      )

      expect(code).toMatchInlineSnapshot(`
          "import type { t_AdditionalPropertiesBool } from "./unit-test.types"

          declare const x: t_AdditionalPropertiesBool"
        `)

      expect(types).toMatchInlineSnapshot(
        `"export type t_AdditionalPropertiesBool = Record<string, any>"`,
      )
    })

    it("handles additionalProperties set to {}", async () => {
      const {code, types} = await getActual(
        "components/schemas/AdditionalPropertiesUnknownEmptySchema",
        {config: {allowAny: true}},
      )

      expect(code).toMatchInlineSnapshot(`
          "import type { t_AdditionalPropertiesUnknownEmptySchema } from "./unit-test.types"

          declare const x: t_AdditionalPropertiesUnknownEmptySchema"
        `)

      expect(types).toMatchInlineSnapshot(
        `"export type t_AdditionalPropertiesUnknownEmptySchema = Record<string, any>"`,
      )
    })

    it("handles additionalProperties set to {type: 'object'}", async () => {
      const {code, types} = await getActual(
        "components/schemas/AdditionalPropertiesUnknownEmptyObjectSchema",
        {config: {allowAny: true}},
      )

      expect(code).toMatchInlineSnapshot(`
          "import type { t_AdditionalPropertiesUnknownEmptyObjectSchema } from "./unit-test.types"

          declare const x: t_AdditionalPropertiesUnknownEmptyObjectSchema"
        `)

      expect(types).toMatchInlineSnapshot(`
          "export type t_AdditionalPropertiesUnknownEmptyObjectSchema = Record<
            string,
            Record<string, any>
          >"
        `)
    })

    it("handles additionalProperties set to true in conjunction with properties", async () => {
      const {code, types} = await getActual(
        "components/schemas/AdditionalPropertiesMixed",
        {config: {allowAny: true}},
      )

      expect(code).toMatchInlineSnapshot(`
          "import type { t_AdditionalPropertiesMixed } from "./unit-test.types"

          declare const x: t_AdditionalPropertiesMixed"
        `)

      expect(types).toMatchInlineSnapshot(`
                  "export type t_AdditionalPropertiesMixed = {
                    id?: string
                    name?: string
                    [key: string]: any | undefined
                  }"
              `)
    })

    it("handles any / empty objects", async () => {
      const {code, types} = await getActual("components/schemas/AnyJsonValue", {
        config: {allowAny: true},
      })

      expect(code).toMatchInlineSnapshot(`
          "import type { t_AnyJsonValue } from "./unit-test.types"

          declare const x: t_AnyJsonValue"
        `)

      expect(types).toMatchInlineSnapshot(`
          "export type t_AnyJsonValue = {
            anyObject?: Record<string, any>
            arrayOfAny?: any[]
            emptyObject?: Record<string, never>
            emptySchema?: any
            emptySchemaAdditionalProperties?: Record<string, any>
          }"
        `)
    })
  })

  describe("unspecified schemas when allowAny: false", () => {
    it("handles additionalProperties set to true", async () => {
      const {code, types} = await getActual(
        "components/schemas/AdditionalPropertiesBool",
        {config: {allowAny: false}},
      )

      expect(code).toMatchInlineSnapshot(`
          "import type { t_AdditionalPropertiesBool } from "./unit-test.types"

          declare const x: t_AdditionalPropertiesBool"
        `)

      expect(types).toMatchInlineSnapshot(
        `"export type t_AdditionalPropertiesBool = Record<string, unknown>"`,
      )
    })

    it("handles additionalProperties set to {}", async () => {
      const {code, types} = await getActual(
        "components/schemas/AdditionalPropertiesUnknownEmptySchema",
        {config: {allowAny: false}},
      )

      expect(code).toMatchInlineSnapshot(`
          "import type { t_AdditionalPropertiesUnknownEmptySchema } from "./unit-test.types"

          declare const x: t_AdditionalPropertiesUnknownEmptySchema"
        `)

      expect(types).toMatchInlineSnapshot(
        `"export type t_AdditionalPropertiesUnknownEmptySchema = Record<string, unknown>"`,
      )
    })

    it("handles additionalProperties set to {type: 'object'}", async () => {
      const {code, types} = await getActual(
        "components/schemas/AdditionalPropertiesUnknownEmptyObjectSchema",
        {config: {allowAny: false}},
      )

      expect(code).toMatchInlineSnapshot(`
          "import type { t_AdditionalPropertiesUnknownEmptyObjectSchema } from "./unit-test.types"

          declare const x: t_AdditionalPropertiesUnknownEmptyObjectSchema"
        `)

      expect(types).toMatchInlineSnapshot(`
          "export type t_AdditionalPropertiesUnknownEmptyObjectSchema = Record<
            string,
            Record<string, unknown>
          >"
        `)
    })

    it("handles additionalProperties set to true in conjunction with properties", async () => {
      const {code, types} = await getActual(
        "components/schemas/AdditionalPropertiesMixed",
        {config: {allowAny: false}},
      )

      expect(code).toMatchInlineSnapshot(`
          "import type { t_AdditionalPropertiesMixed } from "./unit-test.types"

          declare const x: t_AdditionalPropertiesMixed"
        `)

      expect(types).toMatchInlineSnapshot(`
          "export type t_AdditionalPropertiesMixed = {
            id?: string
            name?: string
            [key: string]: unknown | undefined
          }"
        `)
    })

    it("handles any / empty objects", async () => {
      const {code, types} = await getActual("components/schemas/AnyJsonValue", {
        config: {allowAny: false},
      })

      expect(code).toMatchInlineSnapshot(`
          "import type { t_AnyJsonValue } from "./unit-test.types"

          declare const x: t_AnyJsonValue"
        `)

      expect(types).toMatchInlineSnapshot(`
          "export type t_AnyJsonValue = {
            anyObject?: Record<string, unknown>
            arrayOfAny?: unknown[]
            emptyObject?: Record<string, never>
            emptySchema?: unknown
            emptySchemaAdditionalProperties?: Record<string, unknown>
          }"
        `)
    })
  })

  describe("intersections / unions", () => {
    it("can handle a basic A | B", async () => {
      const {code} = await getActualFromModel(
        ir.union({
          schemas: [ir.string(), ir.number()],
        }),
      )

      expect(code).toMatchInlineSnapshot(`"declare const x: string | number"`)
    })

    it("can handle a basic A | B | C | D", async () => {
      const {code} = await getActualFromModel(
        ir.union({
          schemas: [
            ir.string(),
            ir.union({
              schemas: [ir.string(), ir.number(), ir.boolean()],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"declare const x: string | number | boolean"`,
      )
    })

    it("can handle a basic A & B", async () => {
      const {code} = await getActualFromModel(
        ir.intersection({
          schemas: [
            ir.object({properties: {a: ir.string()}}),
            ir.object({properties: {b: ir.string()}}),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "declare const x: {
            a?: string
          } & {
            b?: string
          }"
        `)
    })

    it("can unnest a basic A & B & C", async () => {
      const {code} = await getActualFromModel(
        ir.intersection({
          schemas: [
            ir.object({properties: {a: ir.string()}}),
            ir.intersection({
              schemas: [
                ir.object({properties: {b: ir.string()}}),
                ir.object({properties: {c: ir.string()}}),
              ],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "declare const x: {
            a?: string
          } & {
            b?: string
          } & {
            c?: string
          }"
        `)
    })

    it("can handle intersecting an object with a union A & (B | C)", async () => {
      const {code} = await getActualFromModel(
        ir.intersection({
          schemas: [
            ir.object({
              properties: {base: ir.string()},
              required: ["base"],
            }),
            ir.union({
              schemas: [
                ir.object({
                  properties: {a: ir.number()},
                  required: ["a"],
                }),
                ir.object({
                  properties: {a: ir.string()},
                  required: ["a"],
                }),
              ],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "declare const x: {
            base: string
          } & (
            | {
                a: number
              }
            | {
                a: string
              }
          )"
        `)
    })

    it("can handle intersecting an union with a union (A | B) & (D | C)", async () => {
      const {code} = await getActualFromModel(
        ir.intersection({
          schemas: [
            ir.union({
              schemas: [
                ir.object({
                  properties: {a: ir.number()},
                  required: ["a"],
                }),
                ir.object({
                  properties: {a: ir.string()},
                  required: ["a"],
                }),
              ],
            }),
            ir.union({
              schemas: [
                ir.object({
                  properties: {a: ir.number()},
                  required: ["b"],
                }),
                ir.object({
                  properties: {a: ir.string()},
                  required: ["b"],
                }),
              ],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "declare const x: (
            | {
                a: number
              }
            | {
                a: string
              }
          ) &
            (
              | {
                  a?: number
                }
              | {
                  a?: string
                }
            )"
        `)
    })
  })

  async function getActualFromModel(
    schema: IRModel,
    config: {
      config?: TypeBuilderConfig
      compilerOptions?: CompilerOptions
    } = {},
  ) {
    const {input} = await unitTestInput(version)
    return getResult(schema, input, config)
  }

  async function getActual(
    path: string,
    config: {
      config?: TypeBuilderConfig
      compilerOptions?: CompilerOptions
    } = {},
  ) {
    const {input, file} = await unitTestInput(version)
    const schema = {$ref: `${file}#/${path}`}
    return getResult(schema, input, config)
  }

  async function getResult(
    schema: MaybeIRModel,
    input: Input,
    {
      config = {allowAny: false},
      compilerOptions = {exactOptionalPropertyTypes: false},
    }: {
      config?: TypeBuilderConfig
      compilerOptions?: CompilerOptions
    },
  ) {
    const formatter = await TypescriptFormatterBiome.createNodeFormatter()

    const imports = new ImportBuilder({includeFileExtensions: false})

    const builder = await TypeBuilder.fromInput(
      "./unit-test.types.ts",
      input,
      compilerOptions,
      config,
    )

    const type = builder.withImports(imports).schemaObjectToType(schema)

    const usage = new CompilationUnit(
      "./unit-test.code.ts",
      imports,
      `declare const x: ${type}`,
    )
    const types = builder.toCompilationUnit()

    await typecheck([
      {
        filename: usage.filename,
        content: usage.getRawFileContent({
          allowUnusedImports: false,
          includeHeader: false,
        }),
      },
      {
        filename: types.filename,
        content: types.getRawFileContent({
          allowUnusedImports: false,
          includeHeader: false,
        }),
      },
    ])

    return {
      code: (
        await formatter.format(
          usage.filename,
          usage.getRawFileContent({
            allowUnusedImports: false,
            includeHeader: false,
          }),
        )
      ).result.trim(),
      types: (
        await formatter.format(
          types.filename,
          types.getRawFileContent({
            allowUnusedImports: false,
            includeHeader: false,
          }),
        )
      ).result.trim(),
    }
  }
})
