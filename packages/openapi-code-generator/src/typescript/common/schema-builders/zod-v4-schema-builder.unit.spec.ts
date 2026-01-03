import * as vm from "node:vm"
import {describe, expect, it} from "@jest/globals"
import type {
  SchemaArray,
  SchemaBoolean,
  SchemaNumber,
  SchemaObject,
  SchemaString,
} from "../../../core/openapi-types"
import {isDefined} from "../../../core/utils"
import {testVersions} from "../../../test/input.test-utils"
import type {SchemaBuilderConfig} from "./abstract-schema-builder"
import {
  schemaBuilderTestHarness,
  schemaNumber,
  schemaObject,
  schemaString,
} from "./schema-builder.test-utils"
import {staticSchemas} from "./zod-v4-schema-builder"

describe("typescript/common/schema-builders/zod-v4-schema-builder - unit tests", () => {
  const executeParseSchema = async (code: string) => {
    return vm.runInNewContext(code, {z: require("zod/v4").z, RegExp})
  }

  const {getActualFromModel, getActual} = schemaBuilderTestHarness(
    "zod-v4",
    testVersions[0],
    executeParseSchema,
  )

  describe("numbers", () => {
    const base: SchemaNumber = {
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
        "Invalid input: expected number, received NaN",
      )
    })

    it("supports closed number enums", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        enum: [200, 301, 404],
        "x-enum-extensibility": "closed",
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = z.union([z.literal(200), z.literal(301), z.literal(404)])"',
      )

      await expect(execute(123)).rejects.toThrow("Invalid input: expected 404")
      await expect(execute(404)).resolves.toBe(404)
    })

    it("supports open number enums", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        enum: [200, 301, 404],
        "x-enum-extensibility": "open",
      })

      expect(code).toMatchInlineSnapshot(`
          "const x = z.union([
            z.literal(200),
            z.literal(301),
            z.literal(404),
            z.number().transform((it) => it as typeof it & UnknownEnumNumberValue),
          ])"
        `)

      await expect(execute(123)).resolves.toBe(123)
      await expect(execute(404)).resolves.toBe(404)
      await expect(execute("not a number")).rejects.toThrow(
        "Invalid input: expected number, received string",
      )
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
        "Too small: expected number to be >=10",
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
        "Too big: expected number to be <=16",
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
        "Too small: expected number to be >=10",
      )
      await expect(execute(25)).rejects.toThrow(
        "Too big: expected number to be <=24",
      )
      await expect(execute(20)).resolves.toBe(20)
    })

    it("supports exclusiveMinimum", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        exclusiveMinimum: 4,
      })

      expect(code).toMatchInlineSnapshot('"const x = z.coerce.number().gt(4)"')

      await expect(execute(4)).rejects.toThrow(
        "Too small: expected number to be >4",
      )
      await expect(execute(20)).resolves.toBe(20)
    })

    it("supports exclusiveMaximum", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        exclusiveMaximum: 4,
      })

      expect(code).toMatchInlineSnapshot('"const x = z.coerce.number().lt(4)"')

      await expect(execute(4)).rejects.toThrow(
        "Too big: expected number to be <4",
      )
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
        "Invalid number: must be a multiple of 4",
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
        "Invalid number: must be a multiple of 4",
      )
      await expect(execute(8)).rejects.toThrow(
        "Too small: expected number to be >=10",
      )
      await expect(execute(24)).rejects.toThrow(
        "Too big: expected number to be <=20",
      )
      await expect(execute(16)).resolves.toBe(16)
    })

    it("supports 0", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        minimum: 0,
      })

      expect(code).toMatchInlineSnapshot('"const x = z.coerce.number().min(0)"')

      await expect(execute(-1)).rejects.toThrow(
        "Too small: expected number to be >=0",
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

    it("supports default values of null when nullable", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        nullable: true,
        default: null,
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = z.coerce.number().nullable().default(null)"',
      )

      await expect(execute(undefined)).resolves.toBeNull()
    })
  })

  describe("strings", () => {
    const base: SchemaString = {
      nullable: false,
      readOnly: false,
      type: "string",
    }

    it("supports plain string", async () => {
      const {code, execute} = await getActualFromModel({...base})

      expect(code).toMatchInlineSnapshot('"const x = z.string()"')

      await expect(execute("a string")).resolves.toBe("a string")
      await expect(execute(123)).rejects.toThrow(
        "Invalid input: expected string, received number",
      )
    })

    it("supports closed string enums", async () => {
      const enumValues = ["red", "blue", "green"]
      const {code, execute} = await getActualFromModel({
        ...base,
        enum: enumValues,
        "x-enum-extensibility": "closed",
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = z.enum(["red", "blue", "green"])"`,
      )

      for (const value of enumValues) {
        await expect(execute(value)).resolves.toBe(value)
      }

      await expect(execute("orange")).rejects.toThrow(
        `Invalid option: expected one of \\"red\\"|\\"blue\\"|\\"green\\"`,
      )
    })

    it("supports open string enums", async () => {
      const enumValues = ["red", "blue", "green"]
      const {code, execute} = await getActualFromModel({
        ...base,
        enum: enumValues,
        "x-enum-extensibility": "open",
      })

      expect(code).toMatchInlineSnapshot(`
          "const x = z.union([
            z.enum(["red", "blue", "green"]),
            z.string().transform((it) => it as typeof it & UnknownEnumStringValue),
          ])"
        `)

      for (const value of enumValues) {
        await expect(execute(value)).resolves.toBe(value)
      }
      await expect(execute("orange")).resolves.toBe("orange")
      await expect(execute(404)).rejects.toThrow(
        "Invalid input: expected string, received number",
      )
    })

    it("supports nullable string using allOf", async () => {
      const {code, execute} = await getActualFromModel({
        type: "object",
        anyOf: [
          {type: "string", nullable: false, readOnly: false},
          {type: "null", nullable: false, readOnly: false},
        ],
        allOf: [],
        oneOf: [],
        properties: {},
        additionalProperties: undefined,
        required: [],
        nullable: false,
        readOnly: false,
      })

      expect(code).toMatchInlineSnapshot('"const x = z.string().nullable()"')

      await expect(execute("a string")).resolves.toBe("a string")
      await expect(execute(null)).resolves.toBe(null)
      await expect(execute(123)).rejects.toThrow(
        "Invalid input: expected string, received number",
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
        "Too small: expected string to have >=8 characters",
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
        "Too big: expected string to have <=8 characters",
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
      await expect(execute("pk/abcd")).rejects.toThrow(
        `Invalid string: must match pattern /\\"pk\\\\/\\\\d+\\"/`,
      )
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
      await expect(execute("pk-ab")).rejects.toThrow(
        `Invalid string: must match pattern /pk-\\\\d+/`,
      )
      await expect(execute("pk-1")).rejects.toThrow(
        "Too small: expected string to have >=5 characters",
      )
      await expect(execute("pk-123456")).rejects.toThrow(
        "Too big: expected string to have <=8 characters",
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

    it("supports default values of null when nullable", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        nullable: true,
        default: null,
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = z.string().nullable().default(null)"',
      )

      await expect(execute(undefined)).resolves.toBeNull()
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

    it("coerces incorrectly typed default values to be strings", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        default: false,
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = z.string().default("false")"',
      )

      await expect(execute(undefined)).resolves.toBe("false")
    })

    describe("formats", () => {
      it("supports email", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          format: "email",
        })

        expect(code).toMatchInlineSnapshot('"const x = z.email()"')

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
          '"const x = z.iso.datetime({ offset: true })"',
        )

        await expect(execute("2024-05-25T08:20:00.000Z")).resolves.toBe(
          "2024-05-25T08:20:00.000Z",
        )
        await expect(execute("some string")).rejects.toThrow(
          "Invalid ISO datetime",
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

    const base: SchemaBoolean = {
      nullable: false,
      readOnly: false,
      type: "boolean",
    }

    function inlineStaticSchemas(code: string) {
      const importRegex =
        /import {([^}]+)} from "\.\/unit-test\.schemas(?:\.ts)?"\n/

      const match = code.match(importRegex)?.[1]

      if (match) {
        const definitions = match
          .split(",")
          .map((s) => s.trim())
          .map((it) => {
            const definition = Reflect.get(staticSchemas, it)

            if (definition) {
              return `const ${it} = ${definition}`
            }
            return undefined
          })
          .filter(isDefined)
          .join("\n")

        return `${definitions}\n${code.replace(importRegex, "")}`
      }

      return code
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

      const codeWithoutImport = inlineStaticSchemas(code)

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

      const codeWithoutImport = inlineStaticSchemas(code)

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

    it("supports default values of null when nullable", async () => {
      const {code} = await getActualFromModel({
        ...base,
        nullable: true,
        default: null,
      })

      const codeWithoutImport = inlineStaticSchemas(code)

      expect(codeWithoutImport).toMatchInlineSnapshot(`
          "const PermissiveBoolean = z.preprocess((value) => {
                    if(typeof value === "string" && (value === "true" || value === "false")) {
                      return value === "true"
                    } else if(typeof value === "number" && (value === 1 || value === 0)) {
                      return value === 1
                    }
                    return value
                  }, z.boolean())

          const x = PermissiveBoolean.nullable().default(null)"
        `)

      await expect(
        executeBooleanTest(codeWithoutImport, undefined),
      ).resolves.toBeNull()
    })

    it("support enum of 'true'", async () => {
      const {code} = await getActualFromModel({
        ...base,
        enum: ["true"],
      })

      const codeWithoutImport = inlineStaticSchemas(code)

      expect(codeWithoutImport).toMatchInlineSnapshot(`
          "const PermissiveBoolean = z.preprocess((value) => {
                    if(typeof value === "string" && (value === "true" || value === "false")) {
                      return value === "true"
                    } else if(typeof value === "number" && (value === 1 || value === 0)) {
                      return value === 1
                    }
                    return value
                  }, z.boolean())
          const PermissiveLiteralTrue = z.preprocess((value) => {
                    return PermissiveBoolean.parse(value)
                  }, z.literal(true))

          const x = PermissiveLiteralTrue"
        `)

      await expect(executeBooleanTest(codeWithoutImport, true)).resolves.toBe(
        true,
      )
      await expect(
        executeBooleanTest(codeWithoutImport, false),
      ).rejects.toThrow("Invalid input: expected true")
    })

    it("support enum of 'false'", async () => {
      const {code} = await getActualFromModel({
        ...base,
        enum: ["false"],
      })

      const codeWithoutImport = inlineStaticSchemas(code)

      expect(codeWithoutImport).toMatchInlineSnapshot(`
          "const PermissiveBoolean = z.preprocess((value) => {
                    if(typeof value === "string" && (value === "true" || value === "false")) {
                      return value === "true"
                    } else if(typeof value === "number" && (value === 1 || value === 0)) {
                      return value === 1
                    }
                    return value
                  }, z.boolean())
          const PermissiveLiteralFalse = z.preprocess((value) => {
                    return PermissiveBoolean.parse(value)
                  }, z.literal(false))

          const x = PermissiveLiteralFalse"
        `)

      await expect(executeBooleanTest(codeWithoutImport, false)).resolves.toBe(
        false,
      )
      await expect(executeBooleanTest(codeWithoutImport, true)).rejects.toThrow(
        "Invalid input: expected false",
      )
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
        "Invalid input: expected boolean, received number",
      )
      await expect(executeBooleanTest(code, "yup")).rejects.toThrow(
        "Invalid input: expected boolean, received string",
      )
      await expect(executeBooleanTest(code, [])).rejects.toThrow(
        "Invalid input: expected boolean, received array",
      )
      await expect(executeBooleanTest(code, {})).rejects.toThrow(
        "Invalid input: expected boolean, received Object",
      )
    })
  })

  describe("arrays", () => {
    const base: SchemaArray = {
      nullable: false,
      readOnly: false,
      type: "array",
      items: {nullable: false, readOnly: false, type: "string"},
      uniqueItems: false,
    }

    it("supports arrays", async () => {
      const {code, execute} = await getActualFromModel({...base})

      expect(code).toMatchInlineSnapshot('"const x = z.array(z.string())"')

      await expect(execute([])).resolves.toStrictEqual([])
      await expect(execute(["foo", "bar"])).resolves.toStrictEqual([
        "foo",
        "bar",
      ])
      await expect(execute([1, 2])).rejects.toThrow(
        "Invalid input: expected string, received number",
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
        "Too small: expected array to have >=2 items",
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
        "Too big: expected array to have <=2 items",
      )
    })

    it("supports minItems / maxItems / uniqueItems", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        items: schemaNumber(),
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
        "Too small: expected array to have >=1 items",
      )
      await expect(execute([1, 2, 3, 4])).rejects.toThrow(
        "Too big: expected array to have <=3 items",
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
    const base: SchemaObject = {
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

      await expect(execute({age: 35})).rejects.toThrow(
        "Invalid input: expected string, received undefined",
      )
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
        '"const x = z.record(z.string(), z.coerce.number())"',
      )

      await expect(execute({key: 1})).resolves.toEqual({
        key: 1,
      })
      await expect(execute({key: "string"})).rejects.toThrow(
        // todo: the error here would be better if we avoided using coerce
        "Invalid input: expected number, received NaN",
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

      await expect(execute(undefined)).resolves.toEqual({
        name: "example",
        age: 22,
      })
    })

    it("supports null default when nullable", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        nullable: true,
        default: null,
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = z.record(z.string(), z.unknown()).nullable().default(null)"`,
      )

      await expect(execute(undefined)).resolves.toBeNull()
    })
  })

  describe("unions", () => {
    it("can union a string and number", async () => {
      const {code, execute} = await getActualFromModel(
        schemaObject({
          anyOf: [schemaString(), schemaNumber()],
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.union([z.string(), z.coerce.number()])"`,
      )

      await expect(execute("some string")).resolves.toEqual("some string")
      await expect(execute(1234)).resolves.toEqual(1234)
      await expect(execute(undefined)).rejects.toThrow(
        "Invalid input: expected string, received undefined",
      )
    })

    it("can union an intersected object and string", async () => {
      const {code, execute} = await getActualFromModel(
        schemaObject({
          anyOf: [
            schemaString(),
            schemaObject({
              allOf: [
                schemaObject({
                  properties: {foo: schemaString()},
                  required: ["foo"],
                }),
                schemaObject({
                  properties: {bar: schemaString()},
                  required: ["bar"],
                }),
              ],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "const x = z.union([
            z.string(),
            z.object({ foo: z.string() }).merge(z.object({ bar: z.string() })),
          ])"
        `)

      await expect(execute("some string")).resolves.toEqual("some string")
      await expect(execute({foo: "bla", bar: "foobar"})).resolves.toEqual({
        foo: "bla",
        bar: "foobar",
      })
      // todo: the error here is not great, zod doesn't mention that the received object doesn't match the possible object
      await expect(execute({foo: "bla"})).rejects.toThrow(
        "Invalid input: expected string, received undefined",
      )
    })
  })

  describe("intersections", () => {
    it("can intersect objects", async () => {
      const {code, execute} = await getActualFromModel(
        schemaObject({
          allOf: [
            schemaObject({
              properties: {foo: schemaString()},
              required: ["foo"],
            }),
            schemaObject({
              properties: {bar: schemaString()},
              required: ["bar"],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.object({ foo: z.string() }).merge(z.object({ bar: z.string() }))"`,
      )

      await expect(execute({foo: "bla", bar: "foobar"})).resolves.toEqual({
        foo: "bla",
        bar: "foobar",
      })
      await expect(execute({foo: "bla"})).rejects.toThrow(
        "Invalid input: expected string, received undefined",
      )
    })

    it("can intersect unions", async () => {
      const {code, execute} = await getActualFromModel(
        schemaObject({
          allOf: [
            schemaObject({
              oneOf: [
                schemaObject({
                  properties: {foo: schemaString()},
                  required: ["foo"],
                }),
                schemaObject({
                  properties: {bar: schemaString()},
                  required: ["bar"],
                }),
              ],
            }),
            schemaObject({
              properties: {id: schemaString()},
              required: ["id"],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "const x = z.intersection(
            z.union([z.object({ foo: z.string() }), z.object({ bar: z.string() })]),
            z.object({ id: z.string() }),
          )"
        `)

      await expect(execute({id: "1234", foo: "bla"})).resolves.toEqual({
        id: "1234",
        foo: "bla",
      })
      await expect(execute({id: "1234", bar: "bla"})).resolves.toEqual({
        id: "1234",
        bar: "bla",
      })
      await expect(execute({foo: "bla"})).rejects.toThrow(
        "Invalid input: expected string, received undefined",
      )
    })
  })

  describe("unspecified schemas when allowAny: true", () => {
    const config: SchemaBuilderConfig = {allowAny: true}
    const base: SchemaObject = {
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

      expect(code).toMatchInlineSnapshot(
        '"const x = z.record(z.string(), z.any())"',
      )

      await expect(execute({key: 1})).resolves.toEqual({
        key: 1,
      })
      await expect(execute({key: "string"})).resolves.toEqual({
        key: "string",
      })
      await expect(execute(123)).rejects.toThrow(
        "Invalid input: expected record, received number",
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
        `"const x = z.array(z.record(z.string(), z.any()))"`,
      )

      await expect(execute([{key: 1}])).resolves.toEqual([
        {
          key: 1,
        },
      ])
      await expect(execute({key: "string"})).rejects.toThrow(
        "Invalid input: expected array, received Object",
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
        "Invalid input: expected object, received string",
      )
    })
  })

  describe("unspecified schemas when allowAny: false", () => {
    const config: SchemaBuilderConfig = {allowAny: false}
    const base: SchemaObject = {
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

      expect(code).toMatchInlineSnapshot(
        `"const x = z.record(z.string(), z.unknown())"`,
      )

      await expect(execute({key: 1})).resolves.toEqual({
        key: 1,
      })
      await expect(execute({key: "string"})).resolves.toEqual({
        key: "string",
      })
      await expect(execute(123)).rejects.toThrow(
        "Invalid input: expected record, received number",
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
        `"const x = z.array(z.record(z.string(), z.unknown()))"`,
      )

      await expect(execute([{key: 1}])).resolves.toEqual([
        {
          key: 1,
        },
      ])
      await expect(execute({key: "string"})).rejects.toThrow(
        "Invalid input: expected array, received Object",
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
        "Invalid input: expected object, received string",
      )
    })
  })
})
