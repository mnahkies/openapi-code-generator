import * as vm from "node:vm"
import {beforeAll, beforeEach, describe, expect, it} from "@jest/globals"
import type {CompilerOptions} from "../../../core/loaders/tsconfig.loader"
import type {IRModel} from "../../../core/openapi-types-normalized"
import {isDefined} from "../../../core/utils"
import {FakeSchemaProvider} from "../../../test/fake-schema-provider"
import {irFixture as ir} from "../../../test/ir-model.fixtures.test-utils"
import {TypescriptFormatterBiome} from "../typescript-formatter.biome"
import type {SchemaBuilderConfig} from "./abstract-schema-builder"
import {
  type SchemaBuilderTestHarness,
  schemaBuilderTestHarness,
} from "./schema-builder.test-utils"
import {staticSchemas} from "./zod-v4-schema-builder"

describe("typescript/common/schema-builders/zod-v4-schema-builder - unit tests", () => {
  let formatter: TypescriptFormatterBiome
  let schemaProvider: FakeSchemaProvider
  let testHarness: SchemaBuilderTestHarness

  const executeParseSchema = async (code: string) => {
    return vm.runInNewContext(
      code,
      // Note: done this way for consistency with joi tests
      {z: require("zod/v4").z, RegExp},
    )
  }

  beforeAll(async () => {
    formatter = await TypescriptFormatterBiome.createNodeFormatter()
    testHarness = schemaBuilderTestHarness(
      "zod-v4",
      formatter,
      executeParseSchema,
    )
  })

  beforeEach(() => {
    schemaProvider = new FakeSchemaProvider()
  })

  // todo: figure out how to deal with imports in the vm
  describe.skip("$ref", () => {
    it("will convert a $ref to a name and emit the referenced type", async () => {
      const ref = ir.ref("/components/schemas/User")
      schemaProvider.registerTestRef(
        ref,
        ir.object({properties: {username: ir.string()}}),
      )

      const {code, schemas, execute} = await getActual(
        ir.object({properties: {user: ref}}),
      )

      expect(schemas).toMatchInlineSnapshot(`
        "import { z } from "zod/v4"

        export const s_User = z.object({ username: z.string().optional() })"
      `)
      expect(code).toMatchInlineSnapshot(`
        "import { s_User } from "./unit-test.schemas"

        const x = z.object({ user: s_User.optional() })"
      `)

      await expect(execute({user: {username: "admin"}})).resolves.toStrictEqual(
        {user: {username: "admin"}},
      )
      await expect(execute({user: {name: "admin"}})).rejects.toThrow("foo")
    })
  })

  describe("numbers", () => {
    it("supports plain number", async () => {
      const {code, execute} = await getActual(ir.number())

      expect(code).toMatchInlineSnapshot('"const x = z.coerce.number()"')
      await expect(execute(123)).resolves.toBe(123)
      await expect(execute("not a number 123")).rejects.toThrow(
        "Invalid input: expected number, received NaN",
      )
    })

    it("supports closed number enums", async () => {
      const {code, execute} = await getActual(
        ir.number({
          enum: [200, 301, 404],
          "x-enum-extensibility": "closed",
        }),
      )

      expect(code).toMatchInlineSnapshot(
        '"const x = z.union([z.literal(200), z.literal(301), z.literal(404)])"',
      )

      await expect(execute(123)).rejects.toThrow("Invalid input: expected 404")
      await expect(execute(404)).resolves.toBe(404)
    })

    it("supports open number enums", async () => {
      const {code, execute} = await getActual(
        ir.number({
          enum: [200, 301, 404],
          "x-enum-extensibility": "open",
        }),
      )

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

    it("supports inclusiveMinimum", async () => {
      const {code, execute} = await getActual(ir.number({inclusiveMinimum: 10}))

      expect(code).toMatchInlineSnapshot(
        '"const x = z.coerce.number().min(10)"',
      )

      await expect(execute(5)).rejects.toThrow(
        "Too small: expected number to be >=10",
      )
      await expect(execute(10)).resolves.toBe(10)
      await expect(execute(20)).resolves.toBe(20)
    })

    it("supports inclusiveMaximum", async () => {
      const {code, execute} = await getActual(ir.number({inclusiveMaximum: 16}))

      expect(code).toMatchInlineSnapshot(
        '"const x = z.coerce.number().max(16)"',
      )

      await expect(execute(25)).rejects.toThrow(
        "Too big: expected number to be <=16",
      )
      await expect(execute(16)).resolves.toBe(16)
      await expect(execute(8)).resolves.toBe(8)
    })

    it("supports inclusiveMinimum/inclusiveMaximum", async () => {
      const {code, execute} = await getActual(
        ir.number({inclusiveMinimum: 10, inclusiveMaximum: 24}),
      )

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
      const {code, execute} = await getActual(ir.number({exclusiveMinimum: 4}))

      expect(code).toMatchInlineSnapshot('"const x = z.coerce.number().gt(4)"')

      await expect(execute(4)).rejects.toThrow(
        "Too small: expected number to be >4",
      )
      await expect(execute(20)).resolves.toBe(20)
    })

    it("supports exclusiveMaximum", async () => {
      const {code, execute} = await getActual(ir.number({exclusiveMaximum: 4}))

      expect(code).toMatchInlineSnapshot('"const x = z.coerce.number().lt(4)"')

      await expect(execute(4)).rejects.toThrow(
        "Too big: expected number to be <4",
      )
      await expect(execute(3)).resolves.toBe(3)
    })

    it("supports multipleOf", async () => {
      const {code, execute} = await getActual(ir.number({multipleOf: 4}))

      expect(code).toMatchInlineSnapshot(
        '"const x = z.coerce.number().multipleOf(4)"',
      )

      await expect(execute(11)).rejects.toThrow(
        "Invalid number: must be a multiple of 4",
      )
      await expect(execute(16)).resolves.toBe(16)
    })

    it("supports combining multipleOf and inclusiveMinimum/inclusiveMaximum", async () => {
      const {code, execute} = await getActual(
        ir.number({
          multipleOf: 4,
          inclusiveMinimum: 10,
          inclusiveMaximum: 20,
        }),
      )

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
      const {code, execute} = await getActual(
        ir.number({inclusiveMinimum: 0, inclusiveMaximum: 0}),
      )

      expect(code).toMatchInlineSnapshot(
        '"const x = z.coerce.number().min(0).max(0)"',
      )

      await expect(execute(-1)).rejects.toThrow(
        "Too small: expected number to be >=0",
      )
      await expect(execute(1)).rejects.toThrow(
        "Too big: expected number to be <=0",
      )
      await expect(execute(0)).resolves.toBe(0)
    })

    it("supports default values", async () => {
      const {code, execute} = await getActual(ir.number({default: 42}))

      expect(code).toMatchInlineSnapshot(
        '"const x = z.coerce.number().default(42)"',
      )

      await expect(execute(undefined)).resolves.toBe(42)
    })

    it("supports default values of 0", async () => {
      const {code, execute} = await getActual(ir.number({default: 0}))

      expect(code).toMatchInlineSnapshot(
        '"const x = z.coerce.number().default(0)"',
      )

      await expect(execute(undefined)).resolves.toBe(0)
    })

    it("supports default values of null when nullable", async () => {
      const {code, execute} = await getActual(
        ir.number({nullable: true, default: null}),
      )

      expect(code).toMatchInlineSnapshot(
        '"const x = z.coerce.number().nullable().default(null)"',
      )

      await expect(execute(undefined)).resolves.toBeNull()
    })
  })

  describe("strings", () => {
    it("supports plain string", async () => {
      const {code, execute} = await getActual(ir.string())

      expect(code).toMatchInlineSnapshot('"const x = z.string()"')

      await expect(execute("a string")).resolves.toBe("a string")
      await expect(execute(123)).rejects.toThrow(
        "Invalid input: expected string, received number",
      )
    })

    it("supports nullable string", async () => {
      const {code, execute} = await getActual(ir.string({nullable: true}))

      expect(code).toMatchInlineSnapshot('"const x = z.string().nullable()"')

      await expect(execute("a string")).resolves.toBe("a string")
      await expect(execute(null)).resolves.toBe(null)
      await expect(execute(123)).rejects.toThrow(
        "Invalid input: expected string, received number",
      )
    })

    it("supports closed string enums", async () => {
      const enumValues = ["red", "blue", "green"]

      const {code, execute} = await getActual(
        ir.string({
          enum: enumValues,
          "x-enum-extensibility": "closed",
        }),
      )

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

      const {code, execute} = await getActual(
        ir.string({
          enum: enumValues,
          "x-enum-extensibility": "open",
        }),
      )

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

    it("supports minLength", async () => {
      const {code, execute} = await getActual(ir.string({minLength: 8}))

      expect(code).toMatchInlineSnapshot('"const x = z.string().min(8)"')

      await expect(execute("12345678")).resolves.toBe("12345678")
      await expect(execute("1234567")).rejects.toThrow(
        "Too small: expected string to have >=8 characters",
      )
    })

    it("supports maxLength", async () => {
      const {code, execute} = await getActual(ir.string({maxLength: 8}))

      expect(code).toMatchInlineSnapshot('"const x = z.string().max(8)"')

      await expect(execute("12345678")).resolves.toBe("12345678")
      await expect(execute("123456789")).rejects.toThrow(
        "Too big: expected string to have <=8 characters",
      )
    })

    it("supports pattern", async () => {
      const {code, execute} = await getActual(ir.string({pattern: '"pk/\\d+"'}))

      expect(code).toMatchInlineSnapshot(
        '"const x = z.string().regex(new RegExp(\'"pk/\\\\d+"\'))"',
      )

      await expect(execute('"pk/1234"')).resolves.toBe('"pk/1234"')
      await expect(execute("pk/abcd")).rejects.toThrow(
        `Invalid string: must match pattern /\\"pk\\\\/\\\\d+\\"/`,
      )
    })

    it("supports pattern with minLength / maxLength", async () => {
      const {code, execute} = await getActual(
        ir.string({
          pattern: "pk-\\d+",
          minLength: 5,
          maxLength: 8,
        }),
      )

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
      const {code, execute} = await getActual(ir.string({default: "example"}))

      expect(code).toMatchInlineSnapshot(
        '"const x = z.string().default("example")"',
      )

      await expect(execute(undefined)).resolves.toBe("example")
    })

    it("supports default values of null when nullable", async () => {
      const {code, execute} = await getActual(
        ir.string({nullable: true, default: null}),
      )

      expect(code).toMatchInlineSnapshot(
        '"const x = z.string().nullable().default(null)"',
      )

      await expect(execute(undefined)).resolves.toBeNull()
    })

    it("supports empty string default values", async () => {
      const {code, execute} = await getActual(ir.string({default: ""}))

      expect(code).toMatchInlineSnapshot('"const x = z.string().default("")"')

      await expect(execute(undefined)).resolves.toBe("")
    })

    it("supports default values with quotes", async () => {
      const {code, execute} = await getActual(
        ir.string({
          default: 'this is an "example", it\'s got lots of `quotes`',
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.string().default('this is an "example", it\\'s got lots of \`quotes\`')"`,
      )

      await expect(execute(undefined)).resolves.toBe(
        'this is an "example", it\'s got lots of `quotes`',
      )
    })

    it("coerces incorrectly typed default values to be strings", async () => {
      const {code, execute} = await getActual(ir.string({default: false}))

      expect(code).toMatchInlineSnapshot(
        '"const x = z.string().default("false")"',
      )

      await expect(execute(undefined)).resolves.toBe("false")
    })

    describe("formats", () => {
      it("supports email", async () => {
        const {code, execute} = await getActual(ir.string({format: "email"}))

        expect(code).toMatchInlineSnapshot('"const x = z.email()"')

        await expect(execute("test@example.com")).resolves.toBe(
          "test@example.com",
        )
        await expect(execute("some string")).rejects.toThrow("Invalid email")
      })
      it("supports date-time", async () => {
        const {code, execute} = await getActual(
          ir.string({format: "date-time"}),
        )

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
      it("supports binary", async () => {
        const {code} = await getActual(ir.string({format: "binary"}))

        expect(code).toMatchInlineSnapshot(`"const x = z.any()"`)
        // todo: JSON.stringify doesn't work for passing a Blob into the VM, so can't execute
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
      const {code} = await getActual(ir.boolean())

      expect(code).toMatchInlineSnapshot(`
          "import { PermissiveBoolean } from "./unit-test.schemas"

          const x = PermissiveBoolean"
        `)
    })

    it("supports default values of false", async () => {
      const {code} = await getActual(ir.boolean({default: false}))

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
      const {code} = await getActual(ir.boolean({default: true}))

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
      const {code} = await getActual(
        ir.boolean({nullable: true, default: null}),
      )

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
      const {code} = await getActual(ir.boolean({enum: ["true"]}))

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
      const {code} = await getActual(ir.boolean({enum: ["false"]}))

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
    it("supports arrays", async () => {
      const {code, execute} = await getActual(ir.array({items: ir.string()}))

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
      const {code, execute} = await getActual(
        ir.array({
          items: ir.string(),
          uniqueItems: true,
        }),
      )

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
      const {code, execute} = await getActual(
        ir.array({
          items: ir.string(),
          minItems: 2,
        }),
      )

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
      const {code, execute} = await getActual(
        ir.array({
          items: ir.string(),
          maxItems: 2,
        }),
      )

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
      const {code, execute} = await getActual(
        ir.array({
          items: ir.number(),
          minItems: 1,
          maxItems: 3,
          uniqueItems: true,
        }),
      )

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
      const {code, execute} = await getActual(
        ir.array({
          items: ir.string(),
          default: ["example"],
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.array(z.string()).default(["example"])"`,
      )

      await expect(execute(undefined)).resolves.toStrictEqual(["example"])
    })

    it("supports empty array default values", async () => {
      const {code, execute} = await getActual(
        ir.array({
          items: ir.string(),
          default: [],
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.array(z.string()).default([])"`,
      )

      await expect(execute(undefined)).resolves.toStrictEqual([])
    })
  })

  describe("objects", () => {
    it("supports general objects", async () => {
      const {code, execute} = await getActual(
        ir.object({
          properties: {
            name: ir.string(),
            age: ir.number(),
          },
          required: ["name", "age"],
        }),
      )

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

    it("supports empty objects", async () => {
      const {code, execute} = await getActual(ir.object({properties: {}}))
      expect(code).toMatchInlineSnapshot('"const x = z.object({})"')
      await expect(execute({any: "object"})).resolves.toEqual({})
      await expect(execute("some string")).rejects.toThrow(
        "Invalid input: expected object, received string",
      )
    })

    it("supports objects with a properties + a record property", async () => {
      const {code, execute} = await getActual(
        ir.object({
          required: ["well_defined"],
          properties: {
            well_defined: ir.number(),
          },
          additionalProperties: ir.record({value: ir.number()}),
        }),
      )

      expect(code).toMatchInlineSnapshot(`
        "const x = z.intersection(
          z.object({ well_defined: z.coerce.number() }),
          z.record(z.string(), z.coerce.number()),
        )"
      `)

      await expect(execute({well_defined: 0, key: 1})).resolves.toEqual({
        well_defined: 0,
        key: 1,
      })
      await expect(execute({key: 1})).rejects.toThrow(
        // todo: the error here would be better if we avoided using coerce
        "Invalid input: expected number, received NaN",
      )
      await expect(execute({key: "string"})).rejects.toThrow(
        // todo: the error here would be better if we avoided using coerce
        "Invalid input: expected number, received NaN",
      )
    })

    it("supports objects with just a record property", async () => {
      const {code, execute} = await getActual(
        ir.object({
          properties: {},
          additionalProperties: ir.record({value: ir.number()}),
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.record(z.string(), z.coerce.number())"`,
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
      const {code, execute} = await getActual(
        ir.object({
          properties: {
            name: ir.string(),
            age: ir.number(),
          },
          required: ["name", "age"],
          default: {name: "example", age: 22},
        }),
      )

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
      const {code, execute} = await getActual(
        ir.object({
          required: ["name"],
          properties: {
            name: ir.string(),
          },
          nullable: true,
          default: null,
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.object({ name: z.string() }).nullable().default(null)"`,
      )

      await expect(execute(undefined)).resolves.toBeNull()
    })
  })

  describe("records", () => {
    it("supports a Record<string, T>", async () => {
      const {code, execute} = await getActual(
        ir.record({
          value: ir.number(),
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.record(z.string(), z.coerce.number())"`,
      )

      await expect(execute({foo: 1})).resolves.toStrictEqual({foo: 1})
      await expect(execute({foo: "string"})).rejects.toThrow(
        "Invalid input: expected number, received NaN",
      )
    })

    it("supports a nullable Record<string, T> with default null", async () => {
      const {code, execute} = await getActual(
        ir.record({
          value: ir.number(),
          nullable: true,
          default: null,
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.record(z.string(), z.coerce.number()).nullable().default(null)"`,
      )

      await expect(execute({foo: 1})).resolves.toStrictEqual({foo: 1})
      await expect(execute(undefined)).resolves.toBeNull()
      await expect(execute({foo: "string"})).rejects.toThrow(
        "Invalid input: expected number, received NaN",
      )
    })

    it("supports a Record<string, never>", async () => {
      const {code, execute} = await getActual(
        ir.record({
          value: ir.never(),
        }),
      )

      expect(code).toMatchInlineSnapshot(`"const x = z.object({})"`)

      await expect(execute({})).resolves.toStrictEqual({})
      await expect(execute({foo: "string"})).resolves.toStrictEqual({})
    })
  })

  describe("unions", () => {
    it("can union a string and number", async () => {
      const {code, execute} = await getActual(
        ir.union({
          schemas: [ir.string(), ir.number()],
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
      const {code, execute} = await getActual(
        ir.union({
          schemas: [
            ir.string(),
            ir.intersection({
              schemas: [
                ir.object({
                  properties: {foo: ir.string()},
                  required: ["foo"],
                }),
                ir.object({
                  properties: {bar: ir.string()},
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

    it("unwraps a single element union", async () => {
      const {code, execute} = await getActual(
        ir.union({
          schemas: [ir.string()],
        }),
      )

      expect(code).toMatchInlineSnapshot(`"const x = z.string()"`)

      await expect(execute("some string")).resolves.toEqual("some string")
    })
  })

  describe("intersections", () => {
    it("can intersect objects", async () => {
      const {code, execute} = await getActual(
        ir.intersection({
          schemas: [
            ir.object({
              properties: {foo: ir.string()},
              required: ["foo"],
            }),
            ir.object({
              properties: {bar: ir.string()},
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
      const {code, execute} = await getActual(
        ir.intersection({
          schemas: [
            ir.union({
              schemas: [
                ir.object({
                  properties: {foo: ir.string()},
                  required: ["foo"],
                }),
                ir.object({
                  properties: {bar: ir.string()},
                  required: ["bar"],
                }),
              ],
            }),
            ir.object({
              properties: {id: ir.string()},
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

    it("unwraps a single element primitive intersection", async () => {
      const {code, execute} = await getActual(
        ir.intersection({
          schemas: [ir.string()],
        }),
      )

      expect(code).toMatchInlineSnapshot(`"const x = z.string()"`)

      await expect(execute("some string")).resolves.toEqual("some string")
    })

    it("unwraps a single element object intersection", async () => {
      const {code, execute} = await getActual(
        ir.intersection({
          schemas: [ir.object({properties: {foo: ir.string()}})],
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.object({ foo: z.string().optional() })"`,
      )

      await expect(execute({foo: "bar"})).resolves.toEqual({foo: "bar"})
    })
  })

  describe("any", () => {
    it("supports any when allowAny: true", async () => {
      const {code, execute} = await getActual(ir.any(), {
        config: {allowAny: true},
      })

      expect(code).toMatchInlineSnapshot('"const x = z.any()"')

      await expect(execute({any: "object"})).resolves.toEqual({
        any: "object",
      })
      await expect(execute(["foo", 12])).resolves.toEqual(["foo", 12])
      await expect(execute(null)).resolves.toBeNull()
      await expect(execute(123)).resolves.toBe(123)
      await expect(execute("some string")).resolves.toBe("some string")
    })

    it("supports any when allowAny: false", async () => {
      const {code, execute} = await getActual(ir.any(), {
        config: {allowAny: false},
      })

      expect(code).toMatchInlineSnapshot(`"const x = z.unknown()"`)

      await expect(execute({any: "object"})).resolves.toEqual({
        any: "object",
      })
      await expect(execute(["foo", 12])).resolves.toEqual(["foo", 12])
      await expect(execute(null)).resolves.toBeNull()
      await expect(execute(123)).resolves.toBe(123)
      await expect(execute("some string")).resolves.toBe("some string")
    })

    it("supports any record when allowAny: true", async () => {
      const {code, execute} = await getActual(
        ir.record({
          value: ir.any(),
        }),
        {config: {allowAny: true}},
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = z.record(z.string(), z.any())"`,
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

    it("supports any record objects when allowAny: true", async () => {
      const {code, execute} = await getActual(
        ir.record({
          value: ir.any(),
        }),
        {config: {allowAny: false}},
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

    it("supports any arrays when allowAny: true", async () => {
      const {code, execute} = await getActual(
        ir.array({
          items: ir.any(),
        }),
        {config: {allowAny: true}},
      )

      expect(code).toMatchInlineSnapshot(`"const x = z.array(z.any())"`)

      await expect(execute([{key: 1}])).resolves.toEqual([
        {
          key: 1,
        },
      ])
      await expect(execute({key: "string"})).rejects.toThrow(
        "Invalid input: expected array, received Object",
      )
    })

    it("supports any arrays when allowAny: false", async () => {
      const {code, execute} = await getActual(
        ir.array({
          items: ir.any(),
        }),
        {config: {allowAny: false}},
      )

      expect(code).toMatchInlineSnapshot(`"const x = z.array(z.unknown())"`)

      await expect(execute([{key: 1}])).resolves.toEqual([
        {
          key: 1,
        },
      ])
      await expect(execute({key: "string"})).rejects.toThrow(
        "Invalid input: expected array, received Object",
      )
    })
  })

  describe("never", () => {
    it("supports never", async () => {
      const {code, execute} = await getActual(ir.never())

      expect(code).toMatchInlineSnapshot(`"const x = z.never()"`)

      await expect(execute("some string")).rejects.toThrow(
        "Invalid input: expected never, received string",
      )
    })
  })

  async function getActual(
    schema: IRModel,
    {
      config = {allowAny: false},
      compilerOptions = {exactOptionalPropertyTypes: false},
    }: {
      config?: SchemaBuilderConfig
      compilerOptions?: CompilerOptions
    } = {},
  ) {
    return testHarness.getActual(schema, schemaProvider, {
      config,
      compilerOptions,
    })
  }
})
