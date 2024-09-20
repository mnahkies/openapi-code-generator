import * as vm from "node:vm"
import {describe, expect, it} from "@jest/globals"
import type {
  IRModelArray,
  IRModelBoolean,
  IRModelNumeric,
  IRModelObject,
  IRModelString,
} from "../../../core/openapi-types-normalized"
import {testVersions} from "../../../test/input.test-utils"
import type {SchemaBuilderConfig} from "./abstract-schema-builder"
import {schemaBuilderTestHarness} from "./schema-builder.test-utils"
import {staticSchemas} from "./zod-schema-builder"

describe.each(testVersions)(
  "%s - typescript/common/schema-builders/zod-schema-builder",
  (version) => {
    const executeParseSchema = async (code: string) => {
      return vm.runInNewContext(
        code,
        // Note: done this way for consistency with joi tests
        {z: require("zod").z, RegExp},
      )
    }

    const {getActualFromModel, getActual} = schemaBuilderTestHarness(
      "zod",
      version,
      executeParseSchema,
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

          export const s_AdditionalPropertiesBool = z.record(z.unknown())"
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

          export const s_AdditionalPropertiesUnknownEmptySchema = z.record(z.unknown())"
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
            z.record(z.unknown()),
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
            z.record(z.unknown()),
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
        const {code, execute} = await getActualFromModel({
          ...base,
        })

        expect(code).toMatchInlineSnapshot('"const x = z.coerce.number()"')
        await expect(execute(123)).resolves.toBe(123)
        await expect(execute("not a number 123")).rejects.toThrow(
          "Expected number, received nan",
        )
      })

      it("supports enum number", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          enum: [200, 301, 404],
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.union([z.literal(200), z.literal(301), z.literal(404)])"',
        )

        await expect(execute(123)).rejects.toThrow(
          "Invalid literal value, expected 404",
        )
        await expect(execute(404)).resolves.toBe(404)
      })

      it("supports minimum", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          minimum: 10,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().min(10)"',
        )

        await expect(execute(5)).rejects.toThrow(
          "Number must be greater than or equal to 10",
        )
        await expect(execute(20)).resolves.toBe(20)
      })

      it("supports maximum", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          maximum: 16,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().max(16)"',
        )

        await expect(execute(25)).rejects.toThrow(
          "Number must be less than or equal to 16",
        )
        await expect(execute(8)).resolves.toBe(8)
      })

      it("supports minimum/maximum", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          minimum: 10,
          maximum: 24,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().min(10).max(24)"',
        )

        await expect(execute(5)).rejects.toThrow(
          "Number must be greater than or equal to 10",
        )
        await expect(execute(25)).rejects.toThrow(
          "Number must be less than or equal to 24",
        )
        await expect(execute(20)).resolves.toBe(20)
      })

      it("supports exclusiveMinimum", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          exclusiveMinimum: 4,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().gt(4)"',
        )

        await expect(execute(4)).rejects.toThrow(
          "Number must be greater than 4",
        )
        await expect(execute(20)).resolves.toBe(20)
      })

      it("supports exclusiveMaximum", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          exclusiveMaximum: 4,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().lt(4)"',
        )

        await expect(execute(4)).rejects.toThrow("Number must be less than 4")
        await expect(execute(3)).resolves.toBe(3)
      })

      it("supports multipleOf", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          multipleOf: 4,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().multipleOf(4)"',
        )

        await expect(execute(11)).rejects.toThrow(
          "Number must be a multiple of 4",
        )
        await expect(execute(16)).resolves.toBe(16)
      })

      it("supports combining multipleOf and min/max", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          multipleOf: 4,
          minimum: 10,
          maximum: 20,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().multipleOf(4).min(10).max(20)"',
        )

        await expect(execute(11)).rejects.toThrow(
          "Number must be a multiple of 4",
        )
        await expect(execute(8)).rejects.toThrow(
          "Number must be greater than or equal to 10",
        )
        await expect(execute(24)).rejects.toThrow(
          "Number must be less than or equal to 20",
        )
        await expect(execute(16)).resolves.toBe(16)
      })

      it("supports 0", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          minimum: 0,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().min(0)"',
        )

        await expect(execute(-1)).rejects.toThrow(
          "Number must be greater than or equal to 0",
        )
      })

      it("supports default values", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          default: 42,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().default(42)"',
        )

        await expect(execute(undefined)).resolves.toBe(42)
      })

      it("supports default values of 0", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          default: 0,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.coerce.number().default(0)"',
        )

        await expect(execute(undefined)).resolves.toBe(0)
      })
    })

    describe("strings", () => {
      const base: IRModelString = {
        nullable: false,
        readOnly: false,
        type: "string",
      }

      it("supports plain string", async () => {
        const {code, execute} = await getActualFromModel({...base})

        expect(code).toMatchInlineSnapshot('"const x = z.string()"')

        await expect(execute("a string")).resolves.toBe("a string")
        await expect(execute(123)).rejects.toThrow(
          "Expected string, received number",
        )
      })

      it("supports minLength", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          minLength: 8,
        })
        expect(code).toMatchInlineSnapshot('"const x = z.string().min(8)"')

        await expect(execute("12345678")).resolves.toBe("12345678")
        await expect(execute("1234567")).rejects.toThrow(
          "String must contain at least 8 character(s)",
        )
      })

      it("supports maxLength", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          maxLength: 8,
        })
        expect(code).toMatchInlineSnapshot('"const x = z.string().max(8)"')

        await expect(execute("12345678")).resolves.toBe("12345678")
        await expect(execute("123456789")).rejects.toThrow(
          "String must contain at most 8 character(s)",
        )
      })

      it("supports pattern", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          pattern: '"pk/\\d+"',
        })
        expect(code).toMatchInlineSnapshot(
          '"const x = z.string().regex(new RegExp(\'"pk/\\\\d+"\'))"',
        )

        await expect(execute('"pk/1234"')).resolves.toBe('"pk/1234"')
        await expect(execute("pk/abcd")).rejects.toThrow("invalid_string")
      })

      it("supports pattern with minLength / maxLength", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          pattern: "pk-\\d+",
          minLength: 5,
          maxLength: 8,
        })
        expect(code).toMatchInlineSnapshot(
          '"const x = z.string().min(5).max(8).regex(new RegExp("pk-\\\\d+"))"',
        )

        await expect(execute("pk-12")).resolves.toBe("pk-12")
        await expect(execute("pk-ab")).rejects.toThrow("invalid_string")
        await expect(execute("pk-1")).rejects.toThrow(
          "String must contain at least 5 character(s)",
        )
        await expect(execute("pk-123456")).rejects.toThrow(
          "String must contain at most 8 character(s)",
        )
      })

      it("supports default values", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          default: "example",
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.string().default("example")"',
        )

        await expect(execute(undefined)).resolves.toBe("example")
      })

      it("supports empty string default values", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          default: "",
        })

        expect(code).toMatchInlineSnapshot('"const x = z.string().default("")"')

        await expect(execute(undefined)).resolves.toBe("")
      })

      it("supports default values with quotes", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          default: 'this is an "example", it\'s got lots of `quotes`',
        })

        expect(code).toMatchInlineSnapshot(
          `"const x = z.string().default('this is an "example", it\\'s got lots of \`quotes\`')"`,
        )

        await expect(execute(undefined)).resolves.toBe(
          'this is an "example", it\'s got lots of `quotes`',
        )
      })

      describe("formats", () => {
        it("supports email", async () => {
          const {code, execute} = await getActualFromModel({
            ...base,
            format: "email",
          })

          expect(code).toMatchInlineSnapshot('"const x = z.string().email()"')

          await expect(execute("test@example.com")).resolves.toBe(
            "test@example.com",
          )
          await expect(execute("some string")).rejects.toThrow("Invalid email")
        })
        it("supports date-time", async () => {
          const {code, execute} = await getActualFromModel({
            ...base,
            format: "date-time",
          })

          expect(code).toMatchInlineSnapshot(
            '"const x = z.string().datetime({ offset: true })"',
          )

          await expect(execute("2024-05-25T08:20:00.000Z")).resolves.toBe(
            "2024-05-25T08:20:00.000Z",
          )
          await expect(execute("some string")).rejects.toThrow(
            "Invalid datetime",
          )
        })
      })
    })

    describe("booleans", () => {
      const executeBooleanTest = (code: string, input: unknown) => {
        return executeParseSchema(`(async function () {
        ${code}
        return x.parse(${JSON.stringify(input)})
        })()`)
      }

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

      it("supports default values of false", async () => {
        const {code} = await getActualFromModel({
          ...base,
          default: false,
        })

        const codeWithoutImport = code.replace(
          'import { PermissiveBoolean } from "./unit-test.schemas"',
          `const PermissiveBoolean = ${staticSchemas.PermissiveBoolean}`,
        )

        expect(codeWithoutImport).toMatchInlineSnapshot(`
          "const PermissiveBoolean = z.preprocess((value) => {
                    if(typeof value === "string" && (value === "true" || value === "false")) {
                      return value === "true"
                    } else if(typeof value === "number" && (value === 1 || value === 0)) {
                      return value === 1
                    }
                    return value
                  }, z.boolean())

          const x = PermissiveBoolean.default(false)"
        `)

        await expect(
          executeBooleanTest(codeWithoutImport, undefined),
        ).resolves.toBe(false)
      })

      it("supports default values of true", async () => {
        const {code} = await getActualFromModel({
          ...base,
          default: true,
        })

        const codeWithoutImport = code.replace(
          'import { PermissiveBoolean } from "./unit-test.schemas"',
          `const PermissiveBoolean = ${staticSchemas.PermissiveBoolean}`,
        )

        expect(codeWithoutImport).toMatchInlineSnapshot(`
          "const PermissiveBoolean = z.preprocess((value) => {
                    if(typeof value === "string" && (value === "true" || value === "false")) {
                      return value === "true"
                    } else if(typeof value === "number" && (value === 1 || value === 0)) {
                      return value === 1
                    }
                    return value
                  }, z.boolean())

          const x = PermissiveBoolean.default(true)"
        `)

        await expect(
          executeBooleanTest(codeWithoutImport, undefined),
        ).resolves.toBe(true)
      })

      it("PermissiveBoolean works as expected", async () => {
        const code = `
        const x = ${staticSchemas.PermissiveBoolean}
        `

        await expect(executeBooleanTest(code, true)).resolves.toBe(true)
        await expect(executeBooleanTest(code, false)).resolves.toBe(false)

        await expect(executeBooleanTest(code, "false")).resolves.toBe(false)
        await expect(executeBooleanTest(code, "true")).resolves.toBe(true)

        await expect(executeBooleanTest(code, 0)).resolves.toBe(false)
        await expect(executeBooleanTest(code, 1)).resolves.toBe(true)

        await expect(executeBooleanTest(code, 12)).rejects.toThrow(
          "Expected boolean, received number",
        )
        await expect(executeBooleanTest(code, "yup")).rejects.toThrow(
          "Expected boolean, received string",
        )
        await expect(executeBooleanTest(code, [])).rejects.toThrow(
          "Expected boolean, received array",
        )
        await expect(executeBooleanTest(code, {})).rejects.toThrow(
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
        const {code, execute} = await getActualFromModel({...base})

        expect(code).toMatchInlineSnapshot('"const x = z.array(z.string())"')

        await expect(execute(["foo", "bar"])).resolves.toStrictEqual([
          "foo",
          "bar",
        ])
        await expect(execute([1, 2])).rejects.toThrow(
          "Expected string, received number",
        )
      })

      it("supports uniqueItems", async () => {
        const {code, execute} = await getActualFromModel({
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

        await expect(execute(["foo", "bar"])).resolves.toStrictEqual([
          "foo",
          "bar",
        ])
        await expect(execute(["foo", "foo"])).rejects.toThrow(
          "Array must contain unique element(s)",
        )
      })

      it("supports minItems", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          minItems: 2,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.array(z.string()).min(2)"',
        )

        await expect(execute(["foo", "bar"])).resolves.toStrictEqual([
          "foo",
          "bar",
        ])
        await expect(execute(["foo"])).rejects.toThrow(
          "Array must contain at least 2 element(s)",
        )
      })

      it("supports maxItems", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          maxItems: 2,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.array(z.string()).max(2)"',
        )

        await expect(execute(["foo", "bar"])).resolves.toStrictEqual([
          "foo",
          "bar",
        ])
        await expect(execute(["foo", "bar", "foobar"])).rejects.toThrow(
          "Array must contain at most 2 element(s)",
        )
      })

      it("supports minItems / maxItems / uniqueItems", async () => {
        const {code, execute} = await getActualFromModel({
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

        await expect(execute([1, 2])).resolves.toStrictEqual([1, 2])
        await expect(execute([])).rejects.toThrow(
          "Array must contain at least 1 element(s)",
        )
        await expect(execute([1, 2, 3, 4])).rejects.toThrow(
          "Array must contain at most 3 element(s)",
        )
        await expect(execute([3, 3, 3])).rejects.toThrow(
          "Array must contain unique element(s)",
        )
      })

      it("supports default values", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          default: ["example"],
        })

        expect(code).toMatchInlineSnapshot(
          `"const x = z.array(z.string()).default(["example"])"`,
        )

        await expect(execute(undefined)).resolves.toStrictEqual(["example"])
      })

      it("supports empty array default values", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          default: [],
        })

        expect(code).toMatchInlineSnapshot(
          `"const x = z.array(z.string()).default([])"`,
        )

        await expect(execute(undefined)).resolves.toStrictEqual([])
      })
    })

    describe("objects", () => {
      const base: IRModelObject = {
        type: "object",
        allOf: [],
        anyOf: [],
        oneOf: [],
        properties: {},
        additionalProperties: undefined,
        required: [],
        nullable: false,
        readOnly: false,
      }

      it("supports general objects", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          properties: {
            name: {type: "string", nullable: false, readOnly: false},
            age: {type: "number", nullable: false, readOnly: false},
          },
          required: ["name", "age"],
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.object({ name: z.string(), age: z.coerce.number() })"',
        )

        await expect(execute({name: "John", age: 35})).resolves.toEqual({
          name: "John",
          age: 35,
        })

        await expect(execute({age: 35})).rejects.toThrow("Required")
      })

      it("supports record objects", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          additionalProperties: {
            type: "number",
            nullable: false,
            readOnly: false,
          },
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = z.record(z.coerce.number())"',
        )

        await expect(execute({key: 1})).resolves.toEqual({
          key: 1,
        })
        await expect(execute({key: "string"})).rejects.toThrow(
          // TODO: the error here would be better if we avoided using coerce
          "Expected number, received nan",
        )
      })

      it("supports default values", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          properties: {
            name: {type: "string", nullable: false, readOnly: false},
            age: {type: "number", nullable: false, readOnly: false},
          },
          required: ["name", "age"],
          default: {name: "example", age: 22},
        })

        expect(code).toMatchInlineSnapshot(`
          "const x = z
            .object({ name: z.string(), age: z.coerce.number() })
            .default({ name: "example", age: 22 })"
        `)

        await expect(execute(undefined)).resolves.toStrictEqual({
          name: "example",
          age: 22,
        })
      })
    })

    describe("unspecified schemas when allowAny: true", () => {
      const config: SchemaBuilderConfig = {allowAny: true}
      const base: IRModelObject = {
        type: "object",
        allOf: [],
        anyOf: [],
        oneOf: [],
        properties: {},
        additionalProperties: undefined,
        required: [],
        nullable: false,
        readOnly: false,
      }

      it("supports any objects", async () => {
        const {code, execute} = await getActualFromModel(
          {...base, type: "any"},
          config,
        )

        expect(code).toMatchInlineSnapshot('"const x = z.any()"')

        await expect(execute({any: "object"})).resolves.toEqual({
          any: "object",
        })
        await expect(execute(["foo", 12])).resolves.toEqual(["foo", 12])
        await expect(execute(null)).resolves.toBeNull()
        await expect(execute(123)).resolves.toBe(123)
        await expect(execute("some string")).resolves.toBe("some string")
      })

      it("supports any record objects", async () => {
        const {code, execute} = await getActualFromModel(
          {
            ...base,
            additionalProperties: true,
          },
          config,
        )

        expect(code).toMatchInlineSnapshot('"const x = z.record(z.any())"')

        await expect(execute({key: 1})).resolves.toEqual({
          key: 1,
        })
        await expect(execute({key: "string"})).resolves.toEqual({
          key: "string",
        })
        await expect(execute(123)).rejects.toThrow(
          "Expected object, received number",
        )
      })

      it("supports any arrays", async () => {
        const {code, execute} = await getActualFromModel(
          {
            type: "array",
            nullable: false,
            readOnly: false,
            uniqueItems: false,
            items: {
              ...base,
              additionalProperties: true,
            },
          },
          config,
        )

        expect(code).toMatchInlineSnapshot(
          `"const x = z.array(z.record(z.any()))"`,
        )

        await expect(execute([{key: 1}])).resolves.toEqual([
          {
            key: 1,
          },
        ])
        await expect(execute({key: "string"})).rejects.toThrow(
          "Expected array, received object",
        )
      })

      it("supports empty objects", async () => {
        const {code, execute} = await getActualFromModel(
          {
            ...base,
            additionalProperties: false,
          },
          config,
        )
        expect(code).toMatchInlineSnapshot('"const x = z.object({})"')
        await expect(execute({any: "object"})).resolves.toEqual({})
        await expect(execute("some string")).rejects.toThrow(
          "Expected object, received string",
        )
      })
    })

    describe("unspecified schemas when allowAny: false", () => {
      const config: SchemaBuilderConfig = {allowAny: false}
      const base: IRModelObject = {
        type: "object",
        allOf: [],
        anyOf: [],
        oneOf: [],
        properties: {},
        additionalProperties: undefined,
        required: [],
        nullable: false,
        readOnly: false,
      }

      it("supports any objects", async () => {
        const {code, execute} = await getActualFromModel(
          {...base, type: "any"},
          config,
        )

        expect(code).toMatchInlineSnapshot(`"const x = z.unknown()"`)

        await expect(execute({any: "object"})).resolves.toEqual({
          any: "object",
        })
        await expect(execute(["foo", 12])).resolves.toEqual(["foo", 12])
        await expect(execute(null)).resolves.toBeNull()
        await expect(execute(123)).resolves.toBe(123)
        await expect(execute("some string")).resolves.toBe("some string")
      })

      it("supports any record objects", async () => {
        const {code, execute} = await getActualFromModel(
          {
            ...base,
            additionalProperties: true,
          },
          config,
        )

        expect(code).toMatchInlineSnapshot(`"const x = z.record(z.unknown())"`)

        await expect(execute({key: 1})).resolves.toEqual({
          key: 1,
        })
        await expect(execute({key: "string"})).resolves.toEqual({
          key: "string",
        })
        await expect(execute(123)).rejects.toThrow(
          "Expected object, received number",
        )
      })

      it("supports any arrays", async () => {
        const {code, execute} = await getActualFromModel(
          {
            type: "array",
            nullable: false,
            readOnly: false,
            uniqueItems: false,
            items: {
              ...base,
              additionalProperties: true,
            },
          },
          config,
        )

        expect(code).toMatchInlineSnapshot(
          `"const x = z.array(z.record(z.unknown()))"`,
        )

        await expect(execute([{key: 1}])).resolves.toEqual([
          {
            key: 1,
          },
        ])
        await expect(execute({key: "string"})).rejects.toThrow(
          "Expected array, received object",
        )
      })

      it("supports empty objects", async () => {
        const {code, execute} = await getActualFromModel(
          {
            ...base,
            additionalProperties: false,
          },
          config,
        )
        expect(code).toMatchInlineSnapshot('"const x = z.object({})"')
        await expect(execute({any: "object"})).resolves.toEqual({})
        await expect(execute("some string")).rejects.toThrow(
          "Expected object, received string",
        )
      })
    })
  },
)
