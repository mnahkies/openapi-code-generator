import {describe, expect, it} from "@jest/globals"
import {testVersions, unitTestInput} from "../../../test/input.test-utils"
import {ImportBuilder} from "../import-builder"
import {formatOutput} from "../output-utils"
import {ZodBuilder} from "./zod-schema-builder"

describe.each(testVersions)(
  "%s - typescript/common/schema-builders/zod-schema-builder",
  (version) => {
    it("supports the SimpleObject", async () => {
      const {code, schemas} = await getActual("components/schemas/SimpleObject")

      expect(code).toMatchInlineSnapshot(`
      "import { s_SimpleObject } from "./unit-test.schemas"

      const x = s_SimpleObject
      "
      `)

      expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_SimpleObject = z.object({
        str: z.string(),
        num: z.coerce.number(),
        date: z.string(),
        datetime: z.string().datetime({ offset: true }),
        optional_str: z.string().optional(),
        required_nullable: z.string().nullable(),
      })
      "
    `)
    })

    it("supports the ObjectWithComplexProperties", async () => {
      const {code, schemas} = await getActual(
        "components/schemas/ObjectWithComplexProperties",
      )

      expect(code).toMatchInlineSnapshot(`
      "import { s_ObjectWithComplexProperties } from "./unit-test.schemas"

      const x = s_ObjectWithComplexProperties
      "
      `)

      expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_AString = z.string()

      export const s_OneOf = z.union([
        z.object({ strs: z.array(z.string()) }),
        z.array(z.string()),
        z.string(),
      ])

      export const s_ObjectWithComplexProperties = z.object({
        requiredOneOf: z.union([z.string(), z.coerce.number()]),
        requiredOneOfRef: s_OneOf,
        optionalOneOf: z.union([z.string(), z.coerce.number()]).optional(),
        optionalOneOfRef: s_OneOf.optional(),
        nullableSingularOneOf: z.coerce.boolean().nullable().optional(),
        nullableSingularOneOfRef: s_AString.nullable().optional(),
      })
      "
      `)
    })

    it("supports unions / oneOf", async () => {
      const {code, schemas} = await getActual("components/schemas/OneOf")

      expect(code).toMatchInlineSnapshot(`
      "import { s_OneOf } from "./unit-test.schemas"

      const x = s_OneOf
      "
      `)

      expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_OneOf = z.union([
        z.object({ strs: z.array(z.string()) }),
        z.array(z.string()),
        z.string(),
      ])
      "
    `)
    })

    it("supports unions / anyOf", async () => {
      const {code, schemas} = await getActual("components/schemas/AnyOf")

      expect(code).toMatchInlineSnapshot(`
      "import { s_AnyOf } from "./unit-test.schemas"

      const x = s_AnyOf
      "
      `)

      expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_AnyOf = z.union([z.coerce.number(), z.string()])
      "
    `)
    })

    it("supports allOf", async () => {
      const {code, schemas} = await getActual("components/schemas/AllOf")

      expect(code).toMatchInlineSnapshot(`
      "import { s_AllOf } from "./unit-test.schemas"

      const x = s_AllOf
      "
      `)

      expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_Base = z.object({
        name: z.string(),
        breed: z.string().optional(),
      })

      export const s_AllOf = s_Base.merge(z.object({ id: z.coerce.number() }))
      "
    `)
    })

    it("supports recursion", async () => {
      const {code, schemas} = await getActual("components/schemas/Recursive")

      expect(code).toMatchInlineSnapshot(`
      "import { s_Recursive } from "./unit-test.schemas"

      const x = z.lazy(() => s_Recursive)
      "
      `)

      expect(schemas).toMatchInlineSnapshot(`
      "import { t_Recursive } from "./models"
      import { z } from "zod"

      export const s_Recursive: z.ZodType<t_Recursive> = z.object({
        child: z.lazy(() => s_Recursive.optional()),
      })
      "
    `)
    })

    it("orders schemas such that dependencies are defined first", async () => {
      const {code, schemas} = await getActual("components/schemas/Ordering")

      expect(code).toMatchInlineSnapshot(`
      "import { s_Ordering } from "./unit-test.schemas"

      const x = s_Ordering
      "
      `)

      expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_AOrdering = z.object({ name: z.string().optional() })

      export const s_ZOrdering = z.object({
        name: z.string().optional(),
        dependency1: s_AOrdering,
      })

      export const s_Ordering = z.object({
        dependency1: s_ZOrdering,
        dependency2: s_AOrdering,
      })
      "
    `)
    })

    it("supports string and numeric enums", async () => {
      const {code, schemas} = await getActual("components/schemas/Enums")

      expect(code).toMatchInlineSnapshot(`
      "import { s_Enums } from "./unit-test.schemas"

      const x = s_Enums
      "
      `)

      expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_Enums = z.object({
        str: z.enum(["foo", "bar"]).nullable().optional(),
        num: z
          .union([z.literal(10), z.literal(20)])
          .nullable()
          .optional(),
      })
      "
    `)
    })

    describe("additionalProperties", () => {
      it("handles additionalProperties set to true", async () => {
        const {code, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesBool",
        )

        expect(code).toMatchInlineSnapshot(`
        "import { s_AdditionalPropertiesBool } from "./unit-test.schemas"

        const x = s_AdditionalPropertiesBool
        "
        `)

        expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_AdditionalPropertiesBool = z.record(z.any())
        "
      `)
      })

      it("handles additionalProperties set to {}", async () => {
        const {code, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesUnknownEmptySchema",
        )

        expect(code).toMatchInlineSnapshot(`
        "import { s_AdditionalPropertiesUnknownEmptySchema } from "./unit-test.schemas"

        const x = s_AdditionalPropertiesUnknownEmptySchema
        "
        `)

        expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_AdditionalPropertiesUnknownEmptySchema = z.record(z.any())
        "
      `)
      })

      it("handles additionalProperties set to {type: 'object'}", async () => {
        const {code, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesUnknownEmptyObjectSchema",
        )

        expect(code).toMatchInlineSnapshot(`
        "import { s_AdditionalPropertiesUnknownEmptyObjectSchema } from "./unit-test.schemas"

        const x = s_AdditionalPropertiesUnknownEmptyObjectSchema
        "
        `)

        expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_AdditionalPropertiesUnknownEmptyObjectSchema = z.record(
          z.record(z.any()),
        )
        "
      `)
      })

      it("handles additionalProperties specifying a schema", async () => {
        const {code, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesSchema",
        )

        expect(code).toMatchInlineSnapshot(`
        "import { s_AdditionalPropertiesSchema } from "./unit-test.schemas"

        const x = s_AdditionalPropertiesSchema
        "
        `)

        expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_NamedNullableStringEnum = z
          .enum(["", "one", "two", "three"])
          .nullable()

        export const s_AdditionalPropertiesSchema = z.intersection(
          z.object({ name: z.string().optional() }),
          z.record(s_NamedNullableStringEnum),
        )
        "
      `)
      })

      it("handles additionalProperties in conjunction with properties", async () => {
        const {code, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesMixed",
        )

        expect(code).toMatchInlineSnapshot(`
        "import { s_AdditionalPropertiesMixed } from "./unit-test.schemas"

        const x = s_AdditionalPropertiesMixed
        "
        `)

        expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_AdditionalPropertiesMixed = z.intersection(
          z.object({ id: z.string().optional(), name: z.string().optional() }),
          z.record(z.any()),
        )
        "
      `)
      })
    })

    async function getActual(path: string) {
      const {input, file} = await unitTestInput(version)

      const imports = new ImportBuilder()

      const builder = await ZodBuilder.fromInput(
        "./unit-test.schemas.ts",
        input,
      )

      const schema = builder
        .withImports(imports)
        .fromModel({$ref: `${file}#${path}`}, true)

      return {
        code: await formatOutput(
          `
          ${imports.toString()}

          const x = ${schema}
        `,
          "unit-test.code.ts",
        ),
        schemas: await formatOutput(builder.toString(), "unit-test.schemas.ts"),
      }
    }
  },
)
