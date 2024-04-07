import * as vm from "node:vm"
import {describe, expect, it} from "@jest/globals"
import {
  IRModelArray,
  IRModelBoolean,
  IRModelNumeric,
  IRModelString,
} from "../../../core/openapi-types-normalized"
import {testVersions} from "../../../test/input.test-utils"
import {schemaBuilderTestHarness} from "./schema-builder.test-utils"
import {staticSchemas} from "./zod-schema-builder"

describe.each(testVersions)(
  "%s - typescript/common/schema-builders/zod-schema-builder",
  (version) => {
    const {getActualFromModel, getActual} = schemaBuilderTestHarness(
      "zod",
      version,
    )

    it("supports the SimpleObject", async () => {
      const {code, schemas} = await getActual("components/schemas/SimpleObject")

      expect(code).toMatchInlineSnapshot(`
        "import { s_SimpleObject } from "./unit-test.schemas"

        const x = s_SimpleObject"
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
        })"
      `)
    })

    it("supports the ObjectWithComplexProperties", async () => {
      const {code, schemas} = await getActual(
        "components/schemas/ObjectWithComplexProperties",
      )

      expect(code).toMatchInlineSnapshot(`
        "import { s_ObjectWithComplexProperties } from "./unit-test.schemas"

        const x = s_ObjectWithComplexProperties"
      `)

      expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const PermissiveBoolean = z.preprocess((value) => {
          if (typeof value === "string" && (value === "true" || value === "false")) {
            return value === "true"
          } else if (typeof value === "number" && (value === 1 || value === 0)) {
            return value === 1
          }
          return value
        }, z.boolean())

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
          nullableSingularOneOf: PermissiveBoolean.nullable().optional(),
          nullableSingularOneOfRef: s_AString.nullable().optional(),
        })"
      `)
    })

    it("supports unions / oneOf", async () => {
      const {code, schemas} = await getActual("components/schemas/OneOf")

      expect(code).toMatchInlineSnapshot(`
        "import { s_OneOf } from "./unit-test.schemas"

        const x = s_OneOf"
      `)

      expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_OneOf = z.union([
          z.object({ strs: z.array(z.string()) }),
          z.array(z.string()),
          z.string(),
        ])"
      `)
    })

    it("supports unions / anyOf", async () => {
      const {code, schemas} = await getActual("components/schemas/AnyOf")

      expect(code).toMatchInlineSnapshot(`
        "import { s_AnyOf } from "./unit-test.schemas"

        const x = s_AnyOf"
      `)

      expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_AnyOf = z.union([z.coerce.number(), z.string()])"
      `)
    })

    it("supports allOf", async () => {
      const {code, schemas} = await getActual("components/schemas/AllOf")

      expect(code).toMatchInlineSnapshot(`
        "import { s_AllOf } from "./unit-test.schemas"

        const x = s_AllOf"
      `)

      expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_Base = z.object({
          name: z.string(),
          breed: z.string().optional(),
        })

        export const s_AllOf = s_Base.merge(z.object({ id: z.coerce.number() }))"
      `)
    })

    it("supports recursion", async () => {
      const {code, schemas} = await getActual("components/schemas/Recursive")

      expect(code).toMatchInlineSnapshot(`
        "import { s_Recursive } from "./unit-test.schemas"

        const x = z.lazy(() => s_Recursive)"
      `)

      expect(schemas).toMatchInlineSnapshot(`
        "import { t_Recursive } from "./models"
        import { z } from "zod"

        export const s_Recursive: z.ZodType<t_Recursive, z.ZodTypeDef, unknown> =
          z.object({ child: z.lazy(() => s_Recursive.optional()) })"
      `)
    })

    it("orders schemas such that dependencies are defined first", async () => {
      const {code, schemas} = await getActual("components/schemas/Ordering")

      expect(code).toMatchInlineSnapshot(`
        "import { s_Ordering } from "./unit-test.schemas"

        const x = s_Ordering"
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
        })"
      `)
    })

    it("supports string and numeric enums", async () => {
      const {code, schemas} = await getActual("components/schemas/Enums")

      expect(code).toMatchInlineSnapshot(`
        "import { s_Enums } from "./unit-test.schemas"

        const x = s_Enums"
      `)

      expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod"

        export const s_Enums = z.object({
          str: z.enum(["foo", "bar"]).nullable().optional(),
          num: z
            .union([z.literal(10), z.literal(20)])
            .nullable()
            .optional(),
        })"
      `)
    })

    describe("additionalProperties", () => {
      it("handles additionalProperties set to true", async () => {
        const {code, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesBool",
        )

        expect(code).toMatchInlineSnapshot(`
          "import { s_AdditionalPropertiesBool } from "./unit-test.schemas"

          const x = s_AdditionalPropertiesBool"
        `)

        expect(schemas).toMatchInlineSnapshot(`
          "import { z } from "zod"

          export const s_AdditionalPropertiesBool = z.record(z.any())"
        `)
      })

      it("handles additionalProperties set to {}", async () => {
        const {code, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesUnknownEmptySchema",
        )

        expect(code).toMatchInlineSnapshot(`
          "import { s_AdditionalPropertiesUnknownEmptySchema } from "./unit-test.schemas"

          const x = s_AdditionalPropertiesUnknownEmptySchema"
        `)

        expect(schemas).toMatchInlineSnapshot(`
          "import { z } from "zod"

          export const s_AdditionalPropertiesUnknownEmptySchema = z.record(z.any())"
        `)
      })

      it("handles additionalProperties set to {type: 'object'}", async () => {
        const {code, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesUnknownEmptyObjectSchema",
        )

        expect(code).toMatchInlineSnapshot(`
          "import { s_AdditionalPropertiesUnknownEmptyObjectSchema } from "./unit-test.schemas"

          const x = s_AdditionalPropertiesUnknownEmptyObjectSchema"
        `)

        expect(schemas).toMatchInlineSnapshot(`
          "import { z } from "zod"

          export const s_AdditionalPropertiesUnknownEmptyObjectSchema = z.record(
            z.record(z.any()),
          )"
        `)
      })

      it("handles additionalProperties specifying a schema", async () => {
        const {code, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesSchema",
        )

        expect(code).toMatchInlineSnapshot(`
          "import { s_AdditionalPropertiesSchema } from "./unit-test.schemas"

          const x = s_AdditionalPropertiesSchema"
        `)

        expect(schemas).toMatchInlineSnapshot(`
          "import { z } from "zod"

          export const s_NamedNullableStringEnum = z
            .enum(["", "one", "two", "three"])
            .nullable()

          export const s_AdditionalPropertiesSchema = z.intersection(
            z.object({ name: z.string().optional() }),
            z.record(s_NamedNullableStringEnum),
          )"
        `)
      })

      it("handles additionalProperties in conjunction with properties", async () => {
        const {code, schemas} = await getActual(
          "components/schemas/AdditionalPropertiesMixed",
        )

        expect(code).toMatchInlineSnapshot(`
          "import { s_AdditionalPropertiesMixed } from "./unit-test.schemas"

          const x = s_AdditionalPropertiesMixed"
        `)

        expect(schemas).toMatchInlineSnapshot(`
          "import { z } from "zod"

          export const s_AdditionalPropertiesMixed = z.intersection(
            z.object({ id: z.string().optional(), name: z.string().optional() }),
            z.record(z.any()),
          )"
        `)
      })
    })

    describe("numbers", () => {
      const base: IRModelNumeric = {
        nullable: false,
        readOnly: false,
        type: "number",
      }

      it("supports plain number", async () => {
        const {code} = await getActualFromModel({
          ...base,
        })

        expect(code).toMatchInlineSnapshot('"const x = z.coerce.number()"')
        await expect(executeParseSchema(code, 123)).resolves.toBe(123)
        await expect(
          executeParseSchema(code, "not a number 123"),
        ).rejects.toThrow("Expected number, received nan")
      })

      it("supports enum number", async () => {
        const {code} = await getActualFromModel({
          ...base,
          enum: [200, 301, 404],
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.union([z.literal(200), z.literal(301), z.literal(404)])"',
        )

        await expect(executeParseSchema(code, 123)).rejects.toThrow(
          "Invalid literal value, expected 404",
        )
        await expect(executeParseSchema(code, 404)).resolves.toBe(404)
      })

      it("supports minimum", async () => {
        const {code} = await getActualFromModel({
          ...base,
          minimum: 10,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().min(10)"',
        )

        await expect(executeParseSchema(code, 5)).rejects.toThrow(
          "Number must be greater than or equal to 10",
        )
        await expect(executeParseSchema(code, 20)).resolves.toBe(20)
      })

      it("supports maximum", async () => {
        const {code} = await getActualFromModel({
          ...base,
          maximum: 16,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().max(16)"',
        )

        await expect(executeParseSchema(code, 25)).rejects.toThrow(
          "Number must be less than or equal to 16",
        )
        await expect(executeParseSchema(code, 8)).resolves.toBe(8)
      })

      it("supports minimum/maximum", async () => {
        const {code} = await getActualFromModel({
          ...base,
          minimum: 10,
          maximum: 24,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().min(10).max(24)"',
        )

        await expect(executeParseSchema(code, 5)).rejects.toThrow(
          "Number must be greater than or equal to 10",
        )
        await expect(executeParseSchema(code, 25)).rejects.toThrow(
          "Number must be less than or equal to 24",
        )
        await expect(executeParseSchema(code, 20)).resolves.toBe(20)
      })

      it("supports exclusiveMinimum", async () => {
        const {code} = await getActualFromModel({
          ...base,
          exclusiveMinimum: 4,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().gt(4)"',
        )

        await expect(executeParseSchema(code, 4)).rejects.toThrow(
          "Number must be greater than 4",
        )
        await expect(executeParseSchema(code, 20)).resolves.toBe(20)
      })

      it("supports exclusiveMaximum", async () => {
        const {code} = await getActualFromModel({
          ...base,
          exclusiveMaximum: 4,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().lt(4)"',
        )

        await expect(executeParseSchema(code, 4)).rejects.toThrow(
          "Number must be less than 4",
        )
        await expect(executeParseSchema(code, 3)).resolves.toBe(3)
      })

      it("supports multipleOf", async () => {
        const {code} = await getActualFromModel({
          ...base,
          multipleOf: 4,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().multipleOf(4)"',
        )

        await expect(executeParseSchema(code, 11)).rejects.toThrow(
          "Number must be a multiple of 4",
        )
        await expect(executeParseSchema(code, 16)).resolves.toBe(16)
      })

      it("supports combining multipleOf and min/max", async () => {
        const {code} = await getActualFromModel({
          ...base,
          multipleOf: 4,
          minimum: 10,
          maximum: 20,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().multipleOf(4).min(10).max(20)"',
        )

        await expect(executeParseSchema(code, 11)).rejects.toThrow(
          "Number must be a multiple of 4",
        )
        await expect(executeParseSchema(code, 8)).rejects.toThrow(
          "Number must be greater than or equal to 10",
        )
        await expect(executeParseSchema(code, 24)).rejects.toThrow(
          "Number must be less than or equal to 20",
        )
        await expect(executeParseSchema(code, 16)).resolves.toBe(16)
      })

      it("supports 0", async () => {
        const {code} = await getActualFromModel({...base, minimum: 0})

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().min(0)"',
        )

        await expect(executeParseSchema(code, -1)).rejects.toThrow(
          "Number must be greater than or equal to 0",
        )
      })
    })

    describe("strings", () => {
      const base: IRModelString = {
        nullable: false,
        readOnly: false,
        type: "string",
      }

      it("supports plain string", async () => {
        const {code} = await getActualFromModel({...base})

        expect(code).toMatchInlineSnapshot('"const x = z.string()"')

        await expect(executeParseSchema(code, "a string")).resolves.toBe(
          "a string",
        )
        await expect(executeParseSchema(code, 123)).rejects.toThrow(
          "Expected string, received number",
        )
      })

      it("supports minLength", async () => {
        const {code} = await getActualFromModel({...base, minLength: 8})
        expect(code).toMatchInlineSnapshot('"const x = z.string().min(8)"')

        await expect(executeParseSchema(code, "12345678")).resolves.toBe(
          "12345678",
        )
        await expect(executeParseSchema(code, "1234567")).rejects.toThrow(
          "String must contain at least 8 character(s)",
        )
      })

      it("supports maxLength", async () => {
        const {code} = await getActualFromModel({...base, maxLength: 8})
        expect(code).toMatchInlineSnapshot('"const x = z.string().max(8)"')

        await expect(executeParseSchema(code, "12345678")).resolves.toBe(
          "12345678",
        )
        await expect(executeParseSchema(code, "123456789")).rejects.toThrow(
          "String must contain at most 8 character(s)",
        )
      })

      it("supports pattern", async () => {
        const {code} = await getActualFromModel({
          ...base,
          pattern: '"pk/\\d+"',
        })
        expect(code).toMatchInlineSnapshot(
          '"const x = z.string().regex(new RegExp(\'"pk/\\\\d+"\'))"',
        )

        await expect(executeParseSchema(code, '"pk/1234"')).resolves.toBe(
          '"pk/1234"',
        )
        await expect(executeParseSchema(code, "pk/abcd")).rejects.toThrow(
          "invalid_string",
        )
      })

      it("supports pattern with minLength / maxLength", async () => {
        const {code} = await getActualFromModel({
          ...base,
          pattern: "pk-\\d+",
          minLength: 5,
          maxLength: 8,
        })
        expect(code).toMatchInlineSnapshot(
          '"const x = z.string().min(5).max(8).regex(new RegExp("pk-\\\\d+"))"',
        )

        await expect(executeParseSchema(code, "pk-12")).resolves.toBe("pk-12")
        await expect(executeParseSchema(code, "pk-ab")).rejects.toThrow(
          "invalid_string",
        )
        await expect(executeParseSchema(code, "pk-1")).rejects.toThrow(
          "String must contain at least 5 character(s)",
        )
        await expect(executeParseSchema(code, "pk-123456")).rejects.toThrow(
          "String must contain at most 8 character(s)",
        )
      })
    })

    describe("booleans", () => {
      const base: IRModelBoolean = {
        nullable: false,
        readOnly: false,
        type: "boolean",
      }

      it("supports plain boolean", async () => {
        const {code} = await getActualFromModel({...base})

        expect(code).toMatchInlineSnapshot(`
          "import { PermissiveBoolean } from "./unit-test.schemas"

          const x = PermissiveBoolean"
        `)
      })
      it("PermissiveBoolean works as expected", async () => {
        const code = `
        const x = ${staticSchemas.PermissiveBoolean}
        `

        await expect(executeParseSchema(code, true)).resolves.toBe(true)
        await expect(executeParseSchema(code, false)).resolves.toBe(false)

        await expect(executeParseSchema(code, "false")).resolves.toBe(false)
        await expect(executeParseSchema(code, "true")).resolves.toBe(true)

        await expect(executeParseSchema(code, 0)).resolves.toBe(false)
        await expect(executeParseSchema(code, 1)).resolves.toBe(true)

        await expect(executeParseSchema(code, 12)).rejects.toThrow(
          "Expected boolean, received number",
        )
        await expect(executeParseSchema(code, "yup")).rejects.toThrow(
          "Expected boolean, received string",
        )
        await expect(executeParseSchema(code, [])).rejects.toThrow(
          "Expected boolean, received array",
        )
        await expect(executeParseSchema(code, {})).rejects.toThrow(
          "Expected boolean, received object",
        )
      })
    })

    describe("arrays", () => {
      const base: IRModelArray = {
        nullable: false,
        readOnly: false,
        type: "array",
        items: {nullable: false, readOnly: false, type: "string"},
        uniqueItems: false,
      }

      it("supports arrays", async () => {
        const {code} = await getActualFromModel({...base})

        expect(code).toMatchInlineSnapshot('"const x = z.array(z.string())"')

        await expect(
          executeParseSchema(code, ["foo", "bar"]),
        ).resolves.toStrictEqual(["foo", "bar"])
        await expect(executeParseSchema(code, [1, 2])).rejects.toThrow(
          "Expected string, received number",
        )
      })

      it("supports uniqueItems", async () => {
        const {code} = await getActualFromModel({
          ...base,
          uniqueItems: true,
        })

        expect(code).toMatchInlineSnapshot(`
          "const x = z
            .array(z.string())
            .refine((array) => new Set([...array]).size === array.length, {
              message: "Array must contain unique element(s)",
            })"
        `)

        await expect(
          executeParseSchema(code, ["foo", "bar"]),
        ).resolves.toStrictEqual(["foo", "bar"])
        await expect(executeParseSchema(code, ["foo", "foo"])).rejects.toThrow(
          "Array must contain unique element(s)",
        )
      })

      it("supports minItems", async () => {
        const {code} = await getActualFromModel({...base, minItems: 2})

        expect(code).toMatchInlineSnapshot(
          '"const x = z.array(z.string()).min(2)"',
        )

        await expect(
          executeParseSchema(code, ["foo", "bar"]),
        ).resolves.toStrictEqual(["foo", "bar"])
        await expect(executeParseSchema(code, ["foo"])).rejects.toThrow(
          "Array must contain at least 2 element(s)",
        )
      })

      it("supports maxItems", async () => {
        const {code} = await getActualFromModel({...base, maxItems: 2})

        expect(code).toMatchInlineSnapshot(
          '"const x = z.array(z.string()).max(2)"',
        )

        await expect(
          executeParseSchema(code, ["foo", "bar"]),
        ).resolves.toStrictEqual(["foo", "bar"])
        await expect(
          executeParseSchema(code, ["foo", "bar", "foobar"]),
        ).rejects.toThrow("Array must contain at most 2 element(s)")
      })

      it("supports minItems / maxItems / uniqueItems", async () => {
        const {code} = await getActualFromModel({
          ...base,
          items: {type: "number", nullable: false, readOnly: false},
          minItems: 1,
          maxItems: 3,
          uniqueItems: true,
        })

        expect(code).toMatchInlineSnapshot(`
          "const x = z
            .array(z.coerce.number())
            .min(1)
            .max(3)
            .refine((array) => new Set([...array]).size === array.length, {
              message: "Array must contain unique element(s)",
            })"
        `)

        await expect(executeParseSchema(code, [1, 2])).resolves.toStrictEqual([
          1, 2,
        ])
        await expect(executeParseSchema(code, [])).rejects.toThrow(
          "Array must contain at least 1 element(s)",
        )
        await expect(executeParseSchema(code, [1, 2, 3, 4])).rejects.toThrow(
          "Array must contain at most 3 element(s)",
        )
        await expect(executeParseSchema(code, [3, 3, 3])).rejects.toThrow(
          "Array must contain unique element(s)",
        )
      })
    })

    async function executeParseSchema(code: string, input: unknown) {
      return vm.runInNewContext(
        `
        ${code}

        x.parse(${JSON.stringify(input)})
      `,
        // Note: done this way for consistency with joi tests
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        {z: require("zod").z, RegExp},
      )
    }
  },
)
