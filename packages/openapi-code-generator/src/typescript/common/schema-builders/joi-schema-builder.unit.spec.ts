import * as vm from "node:vm"
import {beforeAll, beforeEach, describe, expect, it} from "@jest/globals"
import type {CompilerOptions} from "../../../core/loaders/tsconfig.loader"
import type {IRModel} from "../../../core/openapi-types-normalized"
import {FakeSchemaProvider} from "../../../test/fake-schema-provider"
import {irFixture as ir} from "../../../test/ir-model.fixtures.test-utils"
import {TypescriptFormatterBiome} from "../typescript-formatter.biome"
import type {SchemaBuilderConfig} from "./abstract-schema-builder"
import {
  type SchemaBuilderTestHarness,
  schemaBuilderTestHarness,
} from "./schema-builder.test-utils"

describe("typescript/common/schema-builders/joi-schema-builder - unit tests", () => {
  let formatter: TypescriptFormatterBiome
  let schemaProvider: FakeSchemaProvider
  let testHarness: SchemaBuilderTestHarness

  const executeParseSchema = async (code: string) => {
    return vm.runInNewContext(
      code,
      // Note: joi relies on `pattern instanceof RegExp` which makes using regex literals
      //       problematic since the RegExp that joi sees isn't the same as the RegExp inside
      //       the context.
      //       I think it should be possible move loading of joi into the context, such that
      //       it gets the contexts global RegExp correctly, but I can't figure it out right now.

      {joi: require("joi"), RegExp},
    )
  }

  beforeAll(async () => {
    formatter = await TypescriptFormatterBiome.createNodeFormatter()
    testHarness = schemaBuilderTestHarness("joi", formatter, executeParseSchema)
  })

  beforeEach(() => {
    schemaProvider = new FakeSchemaProvider()
  })

  describe("numbers", () => {
    it("supports plain number", async () => {
      const {code, execute} = await getActual(ir.number())

      expect(code).toMatchInlineSnapshot('"const x = joi.number().required()"')

      await expect(execute(123)).resolves.toBe(123)
      await expect(execute("not a number 123")).rejects.toThrow(
        '"value" must be a number',
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
        '"const x = joi.number().valid(200, 301, 404).required()"',
      )

      await expect(execute(123)).rejects.toThrow(
        '"value" must be one of [200, 301, 404]',
      )
      await expect(execute(404)).resolves.toBe(404)
    })

    it("supports open number enums", async () => {
      const {code, execute} = await getActual(
        ir.number({
          enum: [200, 301, 404],
          "x-enum-extensibility": "open",
        }),
      )

      expect(code).toMatchInlineSnapshot(`"const x = joi.number().required()"`)

      await expect(execute(123)).resolves.toBe(123)
      await expect(execute(404)).resolves.toBe(404)
      await expect(execute("not a number")).rejects.toThrow(
        '"value" must be a number',
      )
    })

    it("supports inclusiveMinimum", async () => {
      const {code, execute} = await getActual(ir.number({inclusiveMinimum: 10}))

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().min(10).required()"',
      )

      await expect(execute(5)).rejects.toThrow(
        '"value" must be greater than or equal to 10',
      )
      await expect(execute(10)).resolves.toBe(10)
      await expect(execute(20)).resolves.toBe(20)
    })

    it("supports inclusiveMaximum", async () => {
      const {code, execute} = await getActual(ir.number({inclusiveMaximum: 16}))

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().max(16).required()"',
      )

      await expect(execute(25)).rejects.toThrow(
        '"value" must be less than or equal to 16',
      )
      await expect(execute(16)).resolves.toBe(16)
      await expect(execute(8)).resolves.toBe(8)
    })

    it("supports inclusiveMinimum/inclusiveMaximum", async () => {
      const {code, execute} = await getActual(
        ir.number({inclusiveMinimum: 10, inclusiveMaximum: 24}),
      )

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().min(10).max(24).required()"',
      )

      await expect(execute(5)).rejects.toThrow(
        '"value" must be greater than or equal to 10',
      )
      await expect(execute(25)).rejects.toThrow(
        '"value" must be less than or equal to 24',
      )
      await expect(execute(20)).resolves.toBe(20)
    })

    it("supports exclusiveMinimum", async () => {
      const {code, execute} = await getActual(ir.number({exclusiveMinimum: 4}))

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().greater(4).required()"',
      )

      await expect(execute(4)).rejects.toThrow('"value" must be greater than 4')
      await expect(execute(20)).resolves.toBe(20)
    })

    it("supports exclusiveMaximum", async () => {
      const {code, execute} = await getActual(ir.number({exclusiveMaximum: 4}))

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().less(4).required()"',
      )

      await expect(execute(4)).rejects.toThrow('"value" must be less than 4')
      await expect(execute(3)).resolves.toBe(3)
    })

    it("supports multipleOf", async () => {
      const {code, execute} = await getActual(ir.number({multipleOf: 4}))

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().multiple(4).required()"',
      )

      await expect(execute(11)).rejects.toThrow(
        '"value" must be a multiple of 4',
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
        '"const x = joi.number().multiple(4).min(10).max(20).required()"',
      )

      await expect(execute(11)).rejects.toThrow(
        '"value" must be a multiple of 4',
      )
      await expect(execute(8)).rejects.toThrow(
        '"value" must be greater than or equal to 10',
      )
      await expect(execute(24)).rejects.toThrow(
        '"value" must be less than or equal to 20',
      )
      await expect(execute(16)).resolves.toBe(16)
    })

    it("supports 0", async () => {
      const {code, execute} = await getActual(
        ir.number({inclusiveMinimum: 0, inclusiveMaximum: 0}),
      )

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().min(0).max(0).required()"',
      )

      await expect(execute(-1)).rejects.toThrow(
        '"value" must be greater than or equal to 0',
      )
      await expect(execute(1)).rejects.toThrow(
        '"value" must be less than or equal to 0',
      )
      await expect(execute(0)).resolves.toBe(0)
    })

    it("supports default values", async () => {
      const {code, execute} = await getActual(ir.number({default: 42}))

      expect(code).toMatchInlineSnapshot(`"const x = joi.number().default(42)"`)

      await expect(execute(undefined)).resolves.toBe(42)
    })

    it("supports default values of 0", async () => {
      const {code, execute} = await getActual(ir.number({default: 0}))

      expect(code).toMatchInlineSnapshot(`"const x = joi.number().default(0)"`)

      await expect(execute(undefined)).resolves.toBe(0)
    })

    it("supports default values of null when nullable", async () => {
      const {code, execute} = await getActual(
        ir.number({nullable: true, default: null}),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.number().allow(null).default(null)"`,
      )

      await expect(execute(undefined)).resolves.toBeNull()
    })
  })

  describe("strings", () => {
    it("supports plain string", async () => {
      const {code, execute} = await getActual(ir.string())

      expect(code).toMatchInlineSnapshot('"const x = joi.string().required()"')

      await expect(execute("a string")).resolves.toBe("a string")
      await expect(execute(123)).rejects.toThrow('"value" must be a string')
    })

    it("supports nullable string", async () => {
      const {code, execute} = await getActual(ir.string({nullable: true}))

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.string().allow(null).required()"`,
      )

      await expect(execute("a string")).resolves.toBe("a string")
      await expect(execute(null)).resolves.toBe(null)
      await expect(execute(123)).rejects.toThrow('"value" must be a string')
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
        `"const x = joi.string().valid("red", "blue", "green").required()"`,
      )

      for (const value of enumValues) {
        await expect(execute(value)).resolves.toBe(value)
      }

      await expect(execute("orange")).rejects.toThrow(
        '"value" must be one of [red, blue, green]',
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

      expect(code).toMatchInlineSnapshot(`"const x = joi.string().required()"`)

      for (const value of enumValues) {
        await expect(execute(value)).resolves.toBe(value)
      }
      await expect(execute("orange")).resolves.toBe("orange")
      await expect(execute(404)).rejects.toThrow('"value" must be a string')
    })

    it("supports minLength", async () => {
      const {code, execute} = await getActual(ir.string({minLength: 8}))

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.string().min(8).required()"',
      )

      await expect(execute("12345678")).resolves.toBe("12345678")
      await expect(execute("1234567")).rejects.toThrow(
        '"value" length must be at least 8 characters long',
      )
    })

    it("supports maxLength", async () => {
      const {code, execute} = await getActual(ir.string({maxLength: 8}))

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.string().max(8).required()"',
      )

      await expect(execute("12345678")).resolves.toBe("12345678")
      await expect(execute("123456789")).rejects.toThrow(
        '"value" length must be less than or equal to 8 characters long',
      )
    })

    it("supports pattern", async () => {
      const {code, execute} = await getActual(ir.string({pattern: '"pk/\\d+"'}))

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.string().pattern(new RegExp(\'"pk/\\\\d+"\')).required()"',
      )

      await expect(execute('"pk/1234"')).resolves.toBe('"pk/1234"')
      await expect(execute("pk/abcd")).rejects.toThrow(
        '"value" with value "pk/abcd" fails to match the required pattern: /"pk\\/\\d+"/',
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
        '"const x = joi.string().min(5).max(8).pattern(new RegExp("pk-\\\\d+")).required()"',
      )

      await expect(execute("pk-12")).resolves.toBe("pk-12")
      await expect(execute("pk-ab")).rejects.toThrow(
        '"value" with value "pk-ab" fails to match the required pattern: /pk-\\d+/',
      )
      await expect(execute("pk-1")).rejects.toThrow(
        '"value" length must be at least 5 characters long',
      )
      await expect(execute("pk-123456")).rejects.toThrow(
        '"value" length must be less than or equal to 8 characters long',
      )
    })

    it("supports default values", async () => {
      const {code, execute} = await getActual(ir.string({default: "example"}))

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.string().default("example")"`,
      )

      await expect(execute(undefined)).resolves.toBe("example")
    })

    it("supports default values of null when nullable", async () => {
      const {code, execute} = await getActual(
        ir.string({nullable: true, default: null}),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.string().allow(null).default(null)"`,
      )

      await expect(execute(undefined)).resolves.toBeNull()
    })

    it("supports empty string default values", async () => {
      const {code, execute} = await getActual(ir.string({default: ""}))

      expect(code).toMatchInlineSnapshot(`"const x = joi.string().default("")"`)

      await expect(execute(undefined)).resolves.toBe("")
    })

    it("supports default values with quotes", async () => {
      const {code, execute} = await getActual(
        ir.string({
          default: 'this is an "example", it\'s got lots of `quotes`',
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "const x = joi
            .string()
            .default('this is an "example", it\\'s got lots of \`quotes\`')"
        `)

      await expect(execute(undefined)).resolves.toBe(
        'this is an "example", it\'s got lots of `quotes`',
      )
    })

    it("coerces incorrectly typed default values to be strings", async () => {
      const {code, execute} = await getActual(ir.string({default: false}))

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.string().default("false")"`,
      )

      await expect(execute(undefined)).resolves.toBe("false")
    })

    describe("formats", () => {
      it("supports email", async () => {
        const {code, execute} = await getActual(ir.string({format: "email"}))

        expect(code).toMatchInlineSnapshot(
          `"const x = joi.string().email().required()"`,
        )

        await expect(execute("test@example.com")).resolves.toBe(
          "test@example.com",
        )
        await expect(execute("some string")).rejects.toThrow(
          '"value" must be a valid email',
        )
      })
      it("supports date-time", async () => {
        const {code, execute} = await getActual(
          ir.string({format: "date-time"}),
        )

        expect(code).toMatchInlineSnapshot(
          `"const x = joi.string().isoDate().required()"`,
        )

        await expect(execute("2024-05-25T08:20:00.000Z")).resolves.toBe(
          "2024-05-25T08:20:00.000Z",
        )
        await expect(execute("some string")).rejects.toThrow(
          '"value" must be in iso format',
        )
      })
      it("supports binary", async () => {
        const {code} = await getActual(ir.string({format: "binary"}))

        expect(code).toMatchInlineSnapshot(`"const x = joi.any().required()"`)
        // todo: JSON.stringify doesn't work for passing a Blob into the VM, so can't execute
      })
    })
  })

  describe("booleans", () => {
    it("supports plain boolean", async () => {
      const {code, execute} = await getActual(ir.boolean())

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().truthy(1, "1").falsy(0, "0").required()"`,
      )

      await expect(execute(true)).resolves.toBe(true)
      await expect(execute(false)).resolves.toBe(false)

      await expect(execute("false")).resolves.toBe(false)
      await expect(execute("true")).resolves.toBe(true)

      await expect(execute(0)).resolves.toBe(false)
      await expect(execute("0")).resolves.toBe(false)
      await expect(execute(1)).resolves.toBe(true)
      await expect(execute("1")).resolves.toBe(true)

      await expect(execute(12)).rejects.toThrow('"value" must be a boolean')
      await expect(execute("yup")).rejects.toThrow('"value" must be a boolean')
      await expect(execute([])).rejects.toThrow('"value" must be a boolean')
      await expect(execute({})).rejects.toThrow('"value" must be a boolean')
    })

    it("supports default values of false", async () => {
      const {code, execute} = await getActual(
        ir.boolean({
          default: false,
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().truthy(1, "1").falsy(0, "0").default(false)"`,
      )

      await expect(execute(undefined)).resolves.toBe(false)
    })

    it("supports default values of true", async () => {
      const {code, execute} = await getActual(
        ir.boolean({
          default: true,
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().truthy(1, "1").falsy(0, "0").default(true)"`,
      )

      await expect(execute(undefined)).resolves.toBe(true)
    })

    it("supports default values of null when nullable", async () => {
      const {code, execute} = await getActual(
        ir.boolean({
          nullable: true,
          default: null,
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().truthy(1, "1").falsy(0, "0").allow(null).default(null)"`,
      )

      await expect(execute(undefined)).resolves.toBeNull()
    })

    it("support enum of 'true'", async () => {
      const {code, execute} = await getActual(
        ir.boolean({
          enum: ["true"],
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().truthy(1, "1").valid(true).required()"`,
      )

      await expect(execute(true)).resolves.toBe(true)
      await expect(execute(false)).rejects.toThrow('"value" must be [true]')
    })

    it("support enum of 'false'", async () => {
      const {code, execute} = await getActual(
        ir.boolean({
          enum: ["false"],
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().falsy(0, "0").valid(false).required()"`,
      )

      await expect(execute(false)).resolves.toBe(false)
      await expect(execute(true)).rejects.toThrow('"value" must be [false]')
    })
  })

  describe("arrays", () => {
    it("supports arrays", async () => {
      const {code, execute} = await getActual(ir.array({items: ir.string()}))

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.array().items(joi.string()).required()"`,
      )

      await expect(execute([])).resolves.toStrictEqual([])
      await expect(execute(["foo", "bar"])).resolves.toStrictEqual([
        "foo",
        "bar",
      ])
      await expect(execute([1, 2])).rejects.toThrow('"[0]" must be a string')
    })

    it("supports uniqueItems", async () => {
      const {code, execute} = await getActual(
        ir.array({
          items: ir.string(),
          uniqueItems: true,
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.array().items(joi.string()).unique().required()"`,
      )

      await expect(execute(["foo", "bar"])).resolves.toStrictEqual([
        "foo",
        "bar",
      ])
      await expect(execute(["foo", "foo"])).rejects.toThrow(
        '"[1]" contains a duplicate value',
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
        `"const x = joi.array().items(joi.string()).min(2).required()"`,
      )

      await expect(execute(["foo", "bar"])).resolves.toStrictEqual([
        "foo",
        "bar",
      ])
      await expect(execute(["foo"])).rejects.toThrow(
        '"value" must contain at least 2 items',
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
        `"const x = joi.array().items(joi.string()).max(2).required()"`,
      )

      await expect(execute(["foo", "bar"])).resolves.toStrictEqual([
        "foo",
        "bar",
      ])
      await expect(execute(["foo", "bar", "foobar"])).rejects.toThrow(
        '"value" must contain less than or equal to 2 items',
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

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.array().items(joi.number()).unique().min(1).max(3).required()"`,
      )

      await expect(execute([1, 2])).resolves.toStrictEqual([1, 2])
      await expect(execute([])).rejects.toThrow(
        '"value" must contain at least 1 items',
      )
      await expect(execute([1, 2, 3, 4])).rejects.toThrow(
        '"value" must contain less than or equal to 3 items',
      )
      await expect(execute([3, 3, 3])).rejects.toThrow(
        '"[1]" contains a duplicate value',
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
        `"const x = joi.array().items(joi.string()).default(["example"])"`,
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
        `"const x = joi.array().items(joi.string()).default([])"`,
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

      expect(code).toMatchInlineSnapshot(`
          "const x = joi
            .object()
            .keys({ name: joi.string().required(), age: joi.number().required() })
            .options({ stripUnknown: true })
            .required()"
        `)

      await expect(execute({name: "John", age: 35})).resolves.toEqual({
        name: "John",
        age: 35,
      })

      await expect(execute({age: 35})).rejects.toThrow('"name" is required')
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
        "/**
         * Recursively re-distribute the type union/intersection such that joi can support it
         * Eg: from A & (B | C) to (A & B) | (A & C)
         * https://github.com/hapijs/joi/issues/3057
         */
        function joiIntersect(
          left: joi.Schema,
          right: joi.Schema,
        ): joi.ObjectSchema | joi.AlternativesSchema {
          if (isAlternativesSchema(left)) {
            return joi
              .alternatives()
              .match(left.$_getFlag("match") ?? "any")
              .try(...getAlternatives(left).map((it) => joiIntersect(it, right)))
          }

          if (isAlternativesSchema(right)) {
            return joi
              .alternatives()
              .match(right.$_getFlag("match") ?? "any")
              .try(...getAlternatives(right).map((it) => joiIntersect(left, it)))
          }

          if (!isObjectSchema(left) || !isObjectSchema(right)) {
            throw new Error(
              "only objects, or unions of objects can be intersected together.",
            )
          }

          return (left as joi.ObjectSchema).concat(right)

          function isAlternativesSchema(it: joi.Schema): it is joi.AlternativesSchema {
            return it.type === "alternatives"
          }

          function isObjectSchema(it: joi.Schema): it is joi.ObjectSchema {
            return it.type === "object"
          }

          function getAlternatives(it: joi.AlternativesSchema): joi.Schema[] {
            const terms = it.$_terms
            const matches = terms.matches

            if (!Array.isArray(matches)) {
              throw new Error("$_terms.matches is not an array of schemas")
            }

            return matches.map((it) => it.schema)
          }
        }
        const x = joiIntersect(
          joi
            .object()
            .keys({ well_defined: joi.number().required() })
            .options({ stripUnknown: true }),
          joi.object().pattern(joi.any(), joi.number().required()).required(),
        ).required()"
      `)

      await expect(execute({well_defined: 0, key: 1})).resolves.toEqual({
        well_defined: 0,
        key: 1,
      })
      await expect(execute({key: 1})).rejects.toThrow(
        '"well_defined" is required',
      )
      await expect(execute({well_defined: 0, key: "string"})).rejects.toThrow(
        '"key" must be a number',
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
        `"const x = joi.object().pattern(joi.any(), joi.number().required()).required()"`,
      )

      await expect(execute({key: 1})).resolves.toEqual({
        key: 1,
      })
      await expect(execute({key: "string"})).rejects.toThrow(
        '"key" must be a number',
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
          "const x = joi
            .object()
            .keys({ name: joi.string().required(), age: joi.number().required() })
            .options({ stripUnknown: true })
            .default({ name: "example", age: 22 })"
        `)

      // HACK: If we do a toStrictEqual, we get 'Received: serializes to the same string'
      //       presumably due to the use of global that differs inside the VM to outside.
      //       Passing through `Object` doesn't fix it, so just use toEqual ¯\_(ツ)_/¯
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

      expect(code).toMatchInlineSnapshot(`
        "const x = joi
          .object()
          .keys({ name: joi.string().required() })
          .options({ stripUnknown: true })
          .allow(null)
          .default(null)"
      `)

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
        `"const x = joi.object().pattern(joi.any(), joi.number().required()).required()"`,
      )

      await expect(execute({foo: 1})).resolves.toEqual({foo: 1})
      await expect(execute({foo: "string"})).rejects.toThrow(
        '"foo" must be a number',
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

      expect(code).toMatchInlineSnapshot(`
        "const x = joi
          .object()
          .pattern(joi.any(), joi.number().required())
          .allow(null)
          .default(null)"
      `)

      await expect(execute({foo: 1})).resolves.toEqual({foo: 1})
      await expect(execute(undefined)).resolves.toBeNull()
      await expect(execute({foo: "string"})).rejects.toThrow(
        '"foo" must be a number',
      )
    })

    it("supports a Record<string, never>", async () => {
      const {code, execute} = await getActual(
        ir.record({
          value: ir.never(),
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.object().keys({}).options({ stripUnknown: true }).required()"`,
      )

      await expect(execute({})).resolves.toEqual({})
      await expect(execute({foo: "string"})).resolves.toEqual({})
    })
  })

  describe("unions", () => {
    it("can union a string and number", async () => {
      const {code, execute} = await getActual(
        ir.union({
          schemas: [ir.string(), ir.number()],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "const x = joi
            .alternatives()
            .try(joi.string().required(), joi.number().required())
            .required()"
        `)

      await expect(execute("some string")).resolves.toEqual("some string")
      await expect(execute(1234)).resolves.toEqual(1234)
      await expect(execute(undefined)).rejects.toThrow('"value" is required')
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
          "const x = joi
            .alternatives()
            .try(
              joi.string().required(),
              joi
                .object()
                .keys({ foo: joi.string().required() })
                .options({ stripUnknown: true })
                .required()
                .concat(
                  joi
                    .object()
                    .keys({ bar: joi.string().required() })
                    .options({ stripUnknown: true })
                    .required(),
                )
                .required(),
            )
            .required()"
        `)

      await expect(execute("some string")).resolves.toEqual("some string")
      await expect(execute({foo: "bla", bar: "foobar"})).resolves.toEqual({
        foo: "bla",
        bar: "foobar",
      })
      await expect(execute({foo: "bla"})).rejects.toThrow('"bar" is required')
    })

    it("unwraps a single element union", async () => {
      const {code, execute} = await getActual(
        ir.union({
          schemas: [ir.string()],
        }),
      )

      expect(code).toMatchInlineSnapshot(`"const x = joi.string().required()"`)

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

      expect(code).toMatchInlineSnapshot(`
          "const x = joi
            .object()
            .keys({ foo: joi.string().required() })
            .options({ stripUnknown: true })
            .required()
            .concat(
              joi
                .object()
                .keys({ bar: joi.string().required() })
                .options({ stripUnknown: true })
                .required(),
            )
            .required()"
        `)

      await expect(execute({foo: "bla", bar: "foobar"})).resolves.toEqual({
        foo: "bla",
        bar: "foobar",
      })
      await expect(execute({foo: "bla"})).rejects.toThrow('"bar" is required')
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
          "/**
           * Recursively re-distribute the type union/intersection such that joi can support it
           * Eg: from A & (B | C) to (A & B) | (A & C)
           * https://github.com/hapijs/joi/issues/3057
           */
          function joiIntersect(
            left: joi.Schema,
            right: joi.Schema,
          ): joi.ObjectSchema | joi.AlternativesSchema {
            if (isAlternativesSchema(left)) {
              return joi
                .alternatives()
                .match(left.$_getFlag("match") ?? "any")
                .try(...getAlternatives(left).map((it) => joiIntersect(it, right)))
            }

            if (isAlternativesSchema(right)) {
              return joi
                .alternatives()
                .match(right.$_getFlag("match") ?? "any")
                .try(...getAlternatives(right).map((it) => joiIntersect(left, it)))
            }

            if (!isObjectSchema(left) || !isObjectSchema(right)) {
              throw new Error(
                "only objects, or unions of objects can be intersected together.",
              )
            }

            return (left as joi.ObjectSchema).concat(right)

            function isAlternativesSchema(it: joi.Schema): it is joi.AlternativesSchema {
              return it.type === "alternatives"
            }

            function isObjectSchema(it: joi.Schema): it is joi.ObjectSchema {
              return it.type === "object"
            }

            function getAlternatives(it: joi.AlternativesSchema): joi.Schema[] {
              const terms = it.$_terms
              const matches = terms.matches

              if (!Array.isArray(matches)) {
                throw new Error("$_terms.matches is not an array of schemas")
              }

              return matches.map((it) => it.schema)
            }
          }
          const x = joiIntersect(
            joi
              .alternatives()
              .try(
                joi
                  .object()
                  .keys({ foo: joi.string().required() })
                  .options({ stripUnknown: true })
                  .required(),
                joi
                  .object()
                  .keys({ bar: joi.string().required() })
                  .options({ stripUnknown: true })
                  .required(),
              )
              .required(),
            joi
              .object()
              .keys({ id: joi.string().required() })
              .options({ stripUnknown: true })
              .required(),
          ).required()"
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
        '"value" does not match any of the allowed types',
      )
    })

    it("unwraps a single element primitive intersection", async () => {
      const {code, execute} = await getActual(
        ir.intersection({
          schemas: [ir.string()],
        }),
      )

      expect(code).toMatchInlineSnapshot(`"const x = joi.string().required()"`)

      await expect(execute("some string")).resolves.toEqual("some string")
    })

    it("unwraps a single element object intersection", async () => {
      const {code, execute} = await getActual(
        ir.intersection({
          schemas: [ir.object({properties: {foo: ir.string()}})],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
        "const x = joi
          .object()
          .keys({ foo: joi.string() })
          .options({ stripUnknown: true })
          .required()"
      `)

      await expect(execute({foo: "bar"})).resolves.toEqual({foo: "bar"})
    })
  })

  describe("any", () => {
    it("supports any when allowAny: true", async () => {
      const {code, execute} = await getActual(ir.any(), {
        config: {allowAny: true},
      })

      expect(code).toMatchInlineSnapshot(`"const x = joi.any().required()"`)

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

      expect(code).toMatchInlineSnapshot(`"const x = joi.any().required()"`)

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
        `"const x = joi.object().pattern(joi.any(), joi.any()).required()"`,
      )

      await expect(execute({key: 1})).resolves.toEqual({
        key: 1,
      })
      await expect(execute({key: "string"})).resolves.toEqual({
        key: "string",
      })
      await expect(execute(123)).rejects.toThrow(
        '"value" must be of type object',
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
        `"const x = joi.object().pattern(joi.any(), joi.any()).required()"`,
      )

      await expect(execute({key: 1})).resolves.toEqual({
        key: 1,
      })
      await expect(execute({key: "string"})).resolves.toEqual({
        key: "string",
      })
      await expect(execute(123)).rejects.toThrow(
        '"value" must be of type object',
      )
    })

    it("supports any arrays when allowAny: true", async () => {
      const {code, execute} = await getActual(
        ir.array({
          items: ir.any(),
        }),
        {config: {allowAny: true}},
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.array().items(joi.any()).required()"`,
      )

      await expect(execute([{key: 1}])).resolves.toEqual([
        {
          key: 1,
        },
      ])
      await expect(execute({key: "string"})).rejects.toThrow(
        '"value" must be an array',
      )
    })

    it("supports any arrays when allowAny: false", async () => {
      const {code, execute} = await getActual(
        ir.array({
          items: ir.any(),
        }),
        {config: {allowAny: false}},
      )

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.array().items(joi.any()).required()"`,
      )

      await expect(execute([{key: 1}])).resolves.toEqual([
        {
          key: 1,
        },
      ])
      await expect(execute({key: "string"})).rejects.toThrow(
        '"value" must be an array',
      )
    })
  })

  describe("never", () => {
    it.skip("supports never", async () => {
      const {code, execute} = await getActual(ir.never())

      expect(code).toMatchInlineSnapshot(`"const x = joi.any().required()"`)

      await expect(execute("some string")).rejects.toBe("bla")
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
