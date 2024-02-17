/**
 * @prettier
 */

import {describe, it, expect} from "@jest/globals"
import {testVersions, unitTestInput} from "../../test/input.test-utils"
import {TypeBuilder} from "./type-builder"
import {ImportBuilder} from "./import-builder"
import {formatOutput} from "./output-utils"

describe.each(testVersions)(
  "%s - typescript/common/type-builder",
  (version) => {
    it("can build a type for a simple object correctly", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/SimpleObject",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_SimpleObject
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_SimpleObject = {
        date: string
        datetime: string
        num: number
        optional_str?: string
        required_nullable: string | null
        str: string
      }
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_SimpleObject } from "models"
      "
    `)
    })

    it("can build a type for an object that references other objects correctly", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/ObjectWithRefs",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_ObjectWithRefs
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
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
      }
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_ObjectWithRefs, t_SimpleObject } from "models"
      "
    `)
    })

    it("can build a type for a named nullable string enum", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/NamedNullableStringEnum",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_NamedNullableStringEnum
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_NamedNullableStringEnum = "" | "one" | "two" | "three" | null
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_NamedNullableStringEnum } from "models"
      "
    `)
    })

    it("can build a type for a oneOf correctly", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/OneOf",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_OneOf
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_OneOf =
        | {
            strs: string[]
          }
        | string[]
        | string
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_OneOf } from "models"
      "
    `)
    })

    it("can build a type for a anyOf correctly", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/AnyOf",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_AnyOf
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_AnyOf = number | string
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_AnyOf } from "models"
      "
    `)
    })

    it("can build a type for a allOf correctly", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/AllOf",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_AllOf
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_AllOf = t_Base & {
        id: number
      }

      export type t_Base = {
        breed?: string
        name: string
      }
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_AllOf, t_Base } from "models"
      "
    `)
    })

    it("handles additionalProperties set to true", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/AdditionalPropertiesBool",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_AdditionalPropertiesBool
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_AdditionalPropertiesBool = {
        [key: string]: unknown | undefined
      }
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_AdditionalPropertiesBool } from "models"
      "
    `)
    })

    it("handles additionalProperties set to {}", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/AdditionalPropertiesUnknownEmptySchema",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_AdditionalPropertiesUnknownEmptySchema
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_AdditionalPropertiesUnknownEmptySchema = {
        [key: string]: unknown | undefined
      }
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_AdditionalPropertiesUnknownEmptySchema } from "models"
      "
    `)
    })

    it("handles additionalProperties set to {type: 'object'}", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/AdditionalPropertiesUnknownEmptyObjectSchema",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_AdditionalPropertiesUnknownEmptyObjectSchema
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_AdditionalPropertiesUnknownEmptyObjectSchema = {
        [key: string]:
          | {
              [key: string]: unknown | undefined
            }
          | undefined
      }
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_AdditionalPropertiesUnknownEmptyObjectSchema } from "models"
      "
    `)
    })

    it("can build a recursive type correctly", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/Recursive",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_Recursive
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_Recursive = {
        child?: t_Recursive
      }
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_Recursive } from "models"
      "
    `)
    })

    it("handles additionalProperties specifying a schema", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/AdditionalPropertiesSchema",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_AdditionalPropertiesSchema
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_AdditionalPropertiesSchema = {
        name?: string
        [key: string]: t_NamedNullableStringEnum | undefined
      }

      export type t_NamedNullableStringEnum = "" | "one" | "two" | "three" | null
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_AdditionalPropertiesSchema, t_NamedNullableStringEnum } from "models"
      "
    `)
    })

    it("handles additionalProperties in conjunction with properties", async () => {
      const {type, schemas, imports} = await getActual(
        "components/schemas/AdditionalPropertiesMixed",
      )

      expect(type).toMatchInlineSnapshot(`
      "const x: t_AdditionalPropertiesMixed
      "
    `)

      expect(schemas).toMatchInlineSnapshot(`
      "export type t_AdditionalPropertiesMixed = {
        id?: string
        name?: string
        [key: string]: unknown | undefined
      }
      "
    `)

      expect(imports).toMatchInlineSnapshot(`
      "import { t_AdditionalPropertiesMixed } from "models"
      "
    `)
    })

    async function getActual(path: string) {
      const {input, file} = await unitTestInput(version)
      const schema = {$ref: `${file}#/${path}`}

      const imports = new ImportBuilder()

      const builder = TypeBuilder.fromInput("models.ts", input).withImports(
        imports,
      )

      const type = builder.schemaObjectToType(schema)

      return {
        type: await formatOutput(`const x: ${type}`),
        schemas: await formatOutput(builder.toString()),
        imports: await formatOutput(imports.toString()),
      }
    }
  },
)
