import {describe, expect, it} from "@jest/globals"
import {CompilerOptions} from "../../core/loaders/tsconfig.loader"
import {testVersions, unitTestInput} from "../../test/input.test-utils"
import {ImportBuilder} from "./import-builder"
import {TypeBuilder, TypeBuilderConfig} from "./type-builder"
import {TypescriptFormatterBiome} from "./typescript-formatter.biome"

describe.each(testVersions)(
  "%s - typescript/common/type-builder",
  (version) => {
    it("can build a type for a simple object correctly", async () => {
      const {code, types} = await getActual("components/schemas/SimpleObject")

      expect(code).toMatchInlineSnapshot(`
        "import {t_SimpleObject} from './unit-test.types'

        const x: t_SimpleObject"
      `)

      expect(types).toMatchInlineSnapshot(`
        "export type t_SimpleObject = {
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
        "import {t_OptionalProperties} from './unit-test.types'

        const x: t_OptionalProperties"
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
        "import {t_ObjectWithRefs} from './unit-test.types'

        const x: t_ObjectWithRefs"
      `)

      expect(types).toMatchInlineSnapshot(`
        "export type t_ObjectWithRefs = {
          optionalObject?: t_SimpleObject
          requiredObject: t_SimpleObject
        }

        export type t_SimpleObject = {
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
        "import {t_NamedNullableStringEnum} from './unit-test.types'

        const x: t_NamedNullableStringEnum"
      `)

      expect(types).toMatchInlineSnapshot(
        '"export type t_NamedNullableStringEnum = "" | "one" | "two" | "three" | null"',
      )
    })

    it("can build a type for a oneOf correctly", async () => {
      const {code, types} = await getActual("components/schemas/OneOf")

      expect(code).toMatchInlineSnapshot(`
        "import {t_OneOf} from './unit-test.types'

        const x: t_OneOf"
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
        "import {t_AnyOf} from './unit-test.types'

        const x: t_AnyOf"
      `)

      expect(types).toMatchInlineSnapshot(
        '"export type t_AnyOf = number | string"',
      )
    })

    it("can build a type for a allOf correctly", async () => {
      const {code, types} = await getActual("components/schemas/AllOf")

      expect(code).toMatchInlineSnapshot(`
        "import {t_AllOf} from './unit-test.types'

        const x: t_AllOf"
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
        "import {t_Recursive} from './unit-test.types'

        const x: t_Recursive"
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
        "import {t_AdditionalPropertiesSchema} from './unit-test.types'

        const x: t_AdditionalPropertiesSchema"
      `)

      expect(types).toMatchInlineSnapshot(`
        "export type t_AdditionalPropertiesSchema = {
          name?: string
          [key: string]: t_NamedNullableStringEnum | undefined
        }

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
                  "import {t_AdditionalPropertiesBool} from './unit-test.types'

                  const x: t_AdditionalPropertiesBool"
              `)

        expect(types).toMatchInlineSnapshot(`
                  "export type t_AdditionalPropertiesBool = {
                    [key: string]: any | undefined
                  }"
              `)
      })

      it("handles additionalProperties set to {}", async () => {
        const {code, types} = await getActual(
          "components/schemas/AdditionalPropertiesUnknownEmptySchema",
          {config: {allowAny: true}},
        )

        expect(code).toMatchInlineSnapshot(`
                  "import {t_AdditionalPropertiesUnknownEmptySchema} from './unit-test.types'

                  const x: t_AdditionalPropertiesUnknownEmptySchema"
              `)

        expect(types).toMatchInlineSnapshot(`
                  "export type t_AdditionalPropertiesUnknownEmptySchema = {
                    [key: string]: any | undefined
                  }"
              `)
      })

      it("handles additionalProperties set to {type: 'object'}", async () => {
        const {code, types} = await getActual(
          "components/schemas/AdditionalPropertiesUnknownEmptyObjectSchema",
          {config: {allowAny: true}},
        )

        expect(code).toMatchInlineSnapshot(`
                  "import {t_AdditionalPropertiesUnknownEmptyObjectSchema} from './unit-test.types'

                  const x: t_AdditionalPropertiesUnknownEmptyObjectSchema"
              `)

        expect(types).toMatchInlineSnapshot(`
                  "export type t_AdditionalPropertiesUnknownEmptyObjectSchema = {
                    [key: string]:
                      | {
                          [key: string]: any | undefined
                        }
                      | undefined
                  }"
              `)
      })

      it("handles additionalProperties set to true in conjunction with properties", async () => {
        const {code, types} = await getActual(
          "components/schemas/AdditionalPropertiesMixed",
          {config: {allowAny: true}},
        )

        expect(code).toMatchInlineSnapshot(`
                  "import {t_AdditionalPropertiesMixed} from './unit-test.types'

                  const x: t_AdditionalPropertiesMixed"
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
        const {code, types} = await getActual(
          "components/schemas/AnyJsonValue",
          {config: {allowAny: true}},
        )

        expect(code).toMatchInlineSnapshot(`
                  "import {t_AnyJsonValue} from './unit-test.types'

                  const x: t_AnyJsonValue"
              `)

        expect(types).toMatchInlineSnapshot(`
                  "export type EmptyObject = { [key: string]: never }

                  export type t_AnyJsonValue = {
                    anyObject?: {
                      [key: string]: any | undefined
                    }
                    arrayOfAny?: any[]
                    emptyObject?: EmptyObject
                    emptySchema?: any
                    emptySchemaAdditionalProperties?: any
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
                  "import {t_AdditionalPropertiesBool} from './unit-test.types'

                  const x: t_AdditionalPropertiesBool"
              `)

        expect(types).toMatchInlineSnapshot(`
          "export type t_AdditionalPropertiesBool = {
            [key: string]: unknown | undefined
          }"
        `)
      })

      it("handles additionalProperties set to {}", async () => {
        const {code, types} = await getActual(
          "components/schemas/AdditionalPropertiesUnknownEmptySchema",
          {config: {allowAny: false}},
        )

        expect(code).toMatchInlineSnapshot(`
                  "import {t_AdditionalPropertiesUnknownEmptySchema} from './unit-test.types'

                  const x: t_AdditionalPropertiesUnknownEmptySchema"
              `)

        expect(types).toMatchInlineSnapshot(`
          "export type t_AdditionalPropertiesUnknownEmptySchema = {
            [key: string]: unknown | undefined
          }"
        `)
      })

      it("handles additionalProperties set to {type: 'object'}", async () => {
        const {code, types} = await getActual(
          "components/schemas/AdditionalPropertiesUnknownEmptyObjectSchema",
          {config: {allowAny: false}},
        )

        expect(code).toMatchInlineSnapshot(`
                  "import {t_AdditionalPropertiesUnknownEmptyObjectSchema} from './unit-test.types'

                  const x: t_AdditionalPropertiesUnknownEmptyObjectSchema"
              `)

        expect(types).toMatchInlineSnapshot(`
          "export type t_AdditionalPropertiesUnknownEmptyObjectSchema = {
            [key: string]:
              | {
                  [key: string]: unknown | undefined
                }
              | undefined
          }"
        `)
      })

      it("handles additionalProperties set to true in conjunction with properties", async () => {
        const {code, types} = await getActual(
          "components/schemas/AdditionalPropertiesMixed",
          {config: {allowAny: false}},
        )

        expect(code).toMatchInlineSnapshot(`
                  "import {t_AdditionalPropertiesMixed} from './unit-test.types'

                  const x: t_AdditionalPropertiesMixed"
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
        const {code, types} = await getActual(
          "components/schemas/AnyJsonValue",
          {config: {allowAny: false}},
        )

        expect(code).toMatchInlineSnapshot(`
                  "import {t_AnyJsonValue} from './unit-test.types'

                  const x: t_AnyJsonValue"
              `)

        expect(types).toMatchInlineSnapshot(`
          "export type EmptyObject = { [key: string]: never }

          export type t_AnyJsonValue = {
            anyObject?: {
              [key: string]: unknown | undefined
            }
            arrayOfAny?: unknown[]
            emptyObject?: EmptyObject
            emptySchema?: unknown
            emptySchemaAdditionalProperties?: unknown
          }"
        `)
      })
    })

    async function getActual(
      path: string,
      {
        config = {allowAny: false},
        compilerOptions = {exactOptionalPropertyTypes: false},
      }: {
        config?: TypeBuilderConfig
        compilerOptions?: CompilerOptions
      } = {},
    ) {
      const formatter = await TypescriptFormatterBiome.createNodeFormatter()

      const {input, file} = await unitTestInput(version)
      const schema = {$ref: `${file}#/${path}`}

      const imports = new ImportBuilder()

      const builder = await TypeBuilder.fromInput(
        "./unit-test.types.ts",
        input,
        compilerOptions,
        config,
      )

      const type = builder.withImports(imports).schemaObjectToType(schema)

      return {
        code: (
          await formatter.format(
            "./unit-test.code.ts",
            `
          ${imports.toString()}

          const x: ${type}
        `,
          )
        ).trim(),
        types: (
          await formatter.format("unit-test.types.ts", builder.toString())
        ).trim(),
      }
    }
  },
)
