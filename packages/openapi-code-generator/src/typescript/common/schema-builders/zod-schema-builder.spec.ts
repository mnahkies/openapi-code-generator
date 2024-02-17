import {describe, it, expect} from "@jest/globals"
import {ZodBuilder} from "./zod-schema-builder"
import {testVersions, unitTestInput} from "../../../test/input.test-utils"
import {ImportBuilder} from "../import-builder"
import {formatOutput} from "../output-utils"

describe.each(testVersions)(
  "%s - typescript/common/schema-builders/zod-schema-builder",
  (version) => {
    it("supports the SimpleObject", async () => {
      const {model, schemas} = await getActual(
        "components/schemas/SimpleObject",
      )

      expect(model).toMatchInlineSnapshot(`
      "s_SimpleObject
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
      const {model, schemas} = await getActual(
        "components/schemas/ObjectWithComplexProperties",
      )

      expect(model).toMatchInlineSnapshot(`
      "s_ObjectWithComplexProperties
      "
    `)
      expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

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
      })
      "
    `)
    })

    it("supports unions / oneOf", async () => {
      const {model, schemas} = await getActual("components/schemas/OneOf")

      expect(model).toMatchInlineSnapshot(`
      "s_OneOf
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
      const {model, schemas} = await getActual("components/schemas/AnyOf")

      expect(model).toMatchInlineSnapshot(`
      "s_AnyOf
      "
    `)
      expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_AnyOf = z.union([z.coerce.number(), z.string()])
      "
    `)
    })

    it("supports allOf", async () => {
      const {model, schemas} = await getActual("components/schemas/AllOf")

      expect(model).toMatchInlineSnapshot(`
      "s_AllOf
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
      const {model, schemas} = await getActual("components/schemas/Recursive")

      expect(model).toMatchInlineSnapshot(`
      "z.lazy(() => s_Recursive)
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
      const {model, schemas} = await getActual("components/schemas/Ordering")

      expect(model).toMatchInlineSnapshot(`
      "s_Ordering
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
      const {model, schemas} = await getActual("components/schemas/Enums")

      expect(model).toMatchInlineSnapshot(`
      "s_Enums
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
        const {model, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesBool",
        )

        expect(model).toMatchInlineSnapshot(`
        "s_AdditionalPropertiesBool
        "
      `)
        expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_AdditionalPropertiesBool = z.record(z.any())
        "
      `)
      })

      it("handles additionalProperties set to {}", async () => {
        const {model, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesUnknownEmptySchema",
        )

        expect(model).toMatchInlineSnapshot(`
        "s_AdditionalPropertiesUnknownEmptySchema
        "
      `)
        expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_AdditionalPropertiesUnknownEmptySchema = z.record(z.any())
        "
      `)
      })

      it("handles additionalProperties set to {type: 'object'}", async () => {
        const {model, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesUnknownEmptyObjectSchema",
        )

        expect(model).toMatchInlineSnapshot(`
        "s_AdditionalPropertiesUnknownEmptyObjectSchema
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
        const {model, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesSchema",
        )

        expect(model).toMatchInlineSnapshot(`
        "s_AdditionalPropertiesSchema
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
        const {model, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesMixed",
        )

        expect(model).toMatchInlineSnapshot(`
        "s_AdditionalPropertiesMixed
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

      const builder = new ZodBuilder(
        "z",
        "schemas.ts",
        input,
        new ImportBuilder(),
      )

      const model = builder.fromModel({$ref: `${file}#${path}`}, true)

      return {
        model: await formatOutput(model),
        schemas: await formatOutput(builder.toString()),
      }
    }
  },
)
