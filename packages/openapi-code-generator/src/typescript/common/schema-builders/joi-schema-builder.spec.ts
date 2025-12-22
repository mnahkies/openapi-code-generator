import vm from "node:vm"
import {describe, expect, it} from "@jest/globals"
import type {
  SchemaArray,
  SchemaBoolean,
  SchemaNumber,
  SchemaObject,
  SchemaString,
} from "../../../core/openapi-types"
import {testVersions} from "../../../test/input.test-utils"
import type {SchemaBuilderConfig} from "./abstract-schema-builder"
import {
  schemaBuilderTestHarness,
  schemaNumber,
  schemaObject,
  schemaString,
} from "./schema-builder.test-utils"

describe.each(
  testVersions,
)("%s - typescript/common/schema-builders/joi-schema-builder", (version) => {
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

  const {getActual, getActualFromModel} = schemaBuilderTestHarness(
    "joi",
    version,
    executeParseSchema,
  )

  it("supports the SimpleObject", async () => {
    const {code, schemas} = await getActual("components/schemas/SimpleObject")

    expect(code).toMatchInlineSnapshot(`
        "import { s_SimpleObject } from "./unit-test.schemas"

        const x = s_SimpleObject.required()"
      `)

    expect(schemas).toMatchInlineSnapshot(`
        "import joi from "joi"

        export const s_SimpleObject = joi
          .object()
          .keys({
            str: joi.string().required(),
            num: joi.number().required(),
            date: joi.string().required(),
            datetime: joi.string().isoDate().required(),
            optional_str: joi.string(),
            required_nullable: joi.string().allow(null).required(),
            $ref: joi.string(),
          })
          .options({ stripUnknown: true })
          .required()
          .id("s_SimpleObject")"
      `)
  })

  it("supports the ObjectWithComplexProperties", async () => {
    const {code, schemas} = await getActual(
      "components/schemas/ObjectWithComplexProperties",
    )

    expect(code).toMatchInlineSnapshot(`
        "import { s_ObjectWithComplexProperties } from "./unit-test.schemas"

        const x = s_ObjectWithComplexProperties.required()"
      `)

    expect(schemas).toMatchInlineSnapshot(`
        "import joi from "joi"

        export const s_AString = joi.string().required().id("s_AString")

        export const s_OneOf = joi
          .alternatives()
          .try(
            joi
              .object()
              .keys({ strs: joi.array().items(joi.string()).required() })
              .options({ stripUnknown: true })
              .required(),
            joi.array().items(joi.string()).required(),
            joi.string().required(),
          )
          .required()
          .id("s_OneOf")

        export const s_ObjectWithComplexProperties = joi
          .object()
          .keys({
            requiredOneOf: joi
              .alternatives()
              .try(joi.string().required(), joi.number().required())
              .required(),
            requiredOneOfRef: s_OneOf.required(),
            optionalOneOf: joi
              .alternatives()
              .try(joi.string().required(), joi.number().required()),
            optionalOneOfRef: s_OneOf,
            nullableSingularOneOf: joi
              .boolean()
              .truthy(1, "1")
              .falsy(0, "0")
              .allow(null),
            nullableSingularOneOfRef: s_AString.allow(null),
          })
          .options({ stripUnknown: true })
          .required()
          .id("s_ObjectWithComplexProperties")"
      `)
  })

  it("supports unions / oneOf", async () => {
    const {code, schemas} = await getActual("components/schemas/OneOf")

    expect(code).toMatchInlineSnapshot(`
        "import { s_OneOf } from "./unit-test.schemas"

        const x = s_OneOf.required()"
      `)

    expect(schemas).toMatchInlineSnapshot(`
        "import joi from "joi"

        export const s_OneOf = joi
          .alternatives()
          .try(
            joi
              .object()
              .keys({ strs: joi.array().items(joi.string()).required() })
              .options({ stripUnknown: true })
              .required(),
            joi.array().items(joi.string()).required(),
            joi.string().required(),
          )
          .required()
          .id("s_OneOf")"
      `)
  })

  it("supports unions / anyOf", async () => {
    const {code, schemas} = await getActual("components/schemas/AnyOf")

    expect(code).toMatchInlineSnapshot(`
        "import { s_AnyOf } from "./unit-test.schemas"

        const x = s_AnyOf.required()"
      `)

    expect(schemas).toMatchInlineSnapshot(`
        "import joi from "joi"

        export const s_AnyOf = joi
          .alternatives()
          .try(joi.number().required(), joi.string().required())
          .required()
          .id("s_AnyOf")"
      `)
  })

  it("supports allOf", async () => {
    const {code, schemas} = await getActual("components/schemas/AllOf")

    expect(code).toMatchInlineSnapshot(`
        "import { s_AllOf } from "./unit-test.schemas"

        const x = s_AllOf.required()"
      `)

    expect(schemas).toMatchInlineSnapshot(`
        "import joi from "joi"

        export const s_Base = joi
          .object()
          .keys({ name: joi.string().required(), breed: joi.string() })
          .options({ stripUnknown: true })
          .required()
          .id("s_Base")

        export const s_AllOf = s_Base
          .required()
          .concat(
            joi
              .object()
              .keys({ id: joi.number().required() })
              .options({ stripUnknown: true })
              .required(),
          )
          .required()
          .id("s_AllOf")"
      `)
  })

  it("supports recursion", async () => {
    const {code, schemas} = await getActual("components/schemas/Recursive")

    expect(code).toMatchInlineSnapshot(`
        "import { s_Recursive } from "./unit-test.schemas"

        const x = joi.link("#s_Recursive.required()")"
      `)

    expect(schemas).toMatchInlineSnapshot(`
        "import joi from "joi"

        export const s_Recursive = joi
          .object()
          .keys({ child: joi.link("#s_Recursive") })
          .options({ stripUnknown: true })
          .required()
          .id("s_Recursive")"
      `)
  })

  it("orders schemas such that dependencies are defined first", async () => {
    const {code, schemas} = await getActual("components/schemas/Ordering")

    expect(code).toMatchInlineSnapshot(`
        "import { s_Ordering } from "./unit-test.schemas"

        const x = s_Ordering.required()"
      `)

    expect(schemas).toMatchInlineSnapshot(`
        "import joi from "joi"

        export const s_AOrdering = joi
          .object()
          .keys({ name: joi.string() })
          .options({ stripUnknown: true })
          .required()
          .id("s_AOrdering")

        export const s_ZOrdering = joi
          .object()
          .keys({ name: joi.string(), dependency1: s_AOrdering.required() })
          .options({ stripUnknown: true })
          .required()
          .id("s_ZOrdering")

        export const s_Ordering = joi
          .object()
          .keys({
            dependency1: s_ZOrdering.required(),
            dependency2: s_AOrdering.required(),
          })
          .options({ stripUnknown: true })
          .required()
          .id("s_Ordering")"
      `)
  })

  it("supports string and numeric enums", async () => {
    const {code, schemas} = await getActual("components/schemas/Enums")

    expect(code).toMatchInlineSnapshot(`
        "import { s_Enums } from "./unit-test.schemas"

        const x = s_Enums.required()"
      `)

    expect(schemas).toMatchInlineSnapshot(`
        "import joi from "joi"

        export const s_Enums = joi
          .object()
          .keys({
            str: joi.string().valid("foo", "bar").allow(null),
            num: joi.number().valid(10, 20).allow(null),
          })
          .options({ stripUnknown: true })
          .required()
          .id("s_Enums")"
      `)
  })

  describe("additionalProperties", () => {
    it("handles additionalProperties set to true", async () => {
      const {code, schemas} = await getActual(
        "components/schemas/AdditionalPropertiesBool",
      )

      expect(code).toMatchInlineSnapshot(`
          "import { s_AdditionalPropertiesBool } from "./unit-test.schemas"

          const x = s_AdditionalPropertiesBool.required()"
        `)

      expect(schemas).toMatchInlineSnapshot(`
          "import joi from "joi"

          export const s_AdditionalPropertiesBool = joi
            .object()
            .pattern(joi.any(), joi.any())
            .required()
            .id("s_AdditionalPropertiesBool")"
        `)
    })

    it("handles additionalProperties set to {}", async () => {
      const {code, schemas} = await getActual(
        "components/schemas/AdditionalPropertiesUnknownEmptySchema",
      )

      expect(code).toMatchInlineSnapshot(`
          "import { s_AdditionalPropertiesUnknownEmptySchema } from "./unit-test.schemas"

          const x = s_AdditionalPropertiesUnknownEmptySchema.required()"
        `)

      expect(schemas).toMatchInlineSnapshot(`
          "import joi from "joi"

          export const s_AdditionalPropertiesUnknownEmptySchema = joi
            .object()
            .pattern(joi.any(), joi.any())
            .required()
            .id("s_AdditionalPropertiesUnknownEmptySchema")"
        `)
    })

    it("handles additionalProperties set to {type: 'object'}", async () => {
      const {code, schemas} = await getActual(
        "components/schemas/AdditionalPropertiesUnknownEmptyObjectSchema",
      )

      expect(code).toMatchInlineSnapshot(`
          "import { s_AdditionalPropertiesUnknownEmptyObjectSchema } from "./unit-test.schemas"

          const x = s_AdditionalPropertiesUnknownEmptyObjectSchema.required()"
        `)

      expect(schemas).toMatchInlineSnapshot(`
          "import joi from "joi"

          export const s_AdditionalPropertiesUnknownEmptyObjectSchema = joi
            .object()
            .pattern(joi.any(), joi.object().pattern(joi.any(), joi.any()).required())
            .required()
            .id("s_AdditionalPropertiesUnknownEmptyObjectSchema")"
        `)
    })

    it("handles additionalProperties specifying a schema", async () => {
      const {code, schemas} = await getActual(
        "components/schemas/AdditionalPropertiesSchema",
      )

      expect(code).toMatchInlineSnapshot(`
          "import { s_AdditionalPropertiesSchema } from "./unit-test.schemas"

          const x = s_AdditionalPropertiesSchema.required()"
        `)

      expect(schemas).toMatchInlineSnapshot(`
          "import joi from "joi"

          export const s_NamedNullableStringEnum = joi
            .string()
            .valid("", "one", "two", "three")
            .allow(null)
            .required()
            .id("s_NamedNullableStringEnum")

          export const s_AdditionalPropertiesSchema = joi
            .object()
            .pattern(joi.any(), s_NamedNullableStringEnum.required())
            .required()
            .id("s_AdditionalPropertiesSchema")"
        `)
    })

    it("handles additionalProperties in conjunction with properties", async () => {
      const {code, schemas} = await getActual(
        "components/schemas/AdditionalPropertiesMixed",
      )

      expect(code).toMatchInlineSnapshot(`
          "import { s_AdditionalPropertiesMixed } from "./unit-test.schemas"

          const x = s_AdditionalPropertiesMixed.required()"
        `)

      expect(schemas).toMatchInlineSnapshot(`
          "import joi from "joi"

          export const s_AdditionalPropertiesMixed = joi
            .object()
            .keys({ id: joi.string(), name: joi.string() })
            .options({ stripUnknown: true })
            .concat(joi.object().pattern(joi.any(), joi.any()))
            .required()
            .id("s_AdditionalPropertiesMixed")"
        `)
    })
  })

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

      expect(code).toMatchInlineSnapshot('"const x = joi.number().required()"')
      await expect(execute(123)).resolves.toBe(123)
      await expect(execute("not a number 123")).rejects.toThrow(
        '"value" must be a number',
      )
    })

    it("supports closed number enums", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        enum: [200, 301, 404],
        "x-enum-extensibility": "closed",
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().valid(200, 301, 404).required()"',
      )

      await expect(execute(123)).rejects.toThrow(
        '"value" must be one of [200, 301, 404]',
      )
      await expect(execute(404)).resolves.toBe(404)
    })

    it("supports open number enums", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        enum: [200, 301, 404],
        "x-enum-extensibility": "open",
      })

      expect(code).toMatchInlineSnapshot(`"const x = joi.number().required()"`)

      await expect(execute(123)).resolves.toBe(123)
      await expect(execute(404)).resolves.toBe(404)
      await expect(execute("not a number")).rejects.toThrow(
        '"value" must be a number',
      )
    })

    it("supports minimum", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        minimum: 10,
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().min(10).required()"',
      )

      await expect(execute(5)).rejects.toThrow(
        '"value" must be greater than or equal to 10',
      )
      await expect(execute(20)).resolves.toBe(20)
    })

    it("supports maximum", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        maximum: 16,
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().max(16).required()"',
      )

      await expect(execute(25)).rejects.toThrow(
        '"value" must be less than or equal to 16',
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
      const {code, execute} = await getActualFromModel({
        ...base,
        exclusiveMinimum: 4,
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().greater(4).required()"',
      )

      await expect(execute(4)).rejects.toThrow('"value" must be greater than 4')
      await expect(execute(20)).resolves.toBe(20)
    })

    it("supports exclusiveMaximum", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        exclusiveMaximum: 4,
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().less(4).required()"',
      )

      await expect(execute(4)).rejects.toThrow('"value" must be less than 4')
      await expect(execute(3)).resolves.toBe(3)
    })

    it("supports multipleOf", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        multipleOf: 4,
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().multiple(4).required()"',
      )

      await expect(execute(11)).rejects.toThrow(
        '"value" must be a multiple of 4',
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
      const {code, execute} = await getActualFromModel({
        ...base,
        minimum: 0,
      })

      expect(code).toMatchInlineSnapshot(
        '"const x = joi.number().min(0).required()"',
      )

      await expect(execute(-1)).rejects.toThrow(
        '"value" must be greater than or equal to 0',
      )
    })

    it("supports default values", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        default: 42,
      })

      expect(code).toMatchInlineSnapshot(`"const x = joi.number().default(42)"`)

      await expect(execute(undefined)).resolves.toBe(42)
    })

    it("supports default values of 0", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        default: 0,
      })

      expect(code).toMatchInlineSnapshot(`"const x = joi.number().default(0)"`)

      await expect(execute(undefined)).resolves.toBe(0)
    })

    it("supports default values of null when nullable", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        nullable: true,
        default: null,
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.number().allow(null).default(null)"`,
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

      expect(code).toMatchInlineSnapshot('"const x = joi.string().required()"')

      await expect(execute("a string")).resolves.toBe("a string")
      await expect(execute(123)).rejects.toThrow('"value" must be a string')
    })

    it("supports closed string enums", async () => {
      const enumValues = ["red", "blue", "green"]
      const {code, execute} = await getActualFromModel({
        ...base,
        enum: enumValues,
        "x-enum-extensibility": "closed",
      })

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
      const {code, execute} = await getActualFromModel({
        ...base,
        enum: enumValues,
        "x-enum-extensibility": "open",
      })

      expect(code).toMatchInlineSnapshot(`"const x = joi.string().required()"`)

      for (const value of enumValues) {
        await expect(execute(value)).resolves.toBe(value)
      }
      await expect(execute("orange")).resolves.toBe("orange")
      await expect(execute(404)).rejects.toThrow('"value" must be a string')
    })

    it("supports minLength", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        minLength: 8,
      })
      expect(code).toMatchInlineSnapshot(
        '"const x = joi.string().min(8).required()"',
      )

      await expect(execute("12345678")).resolves.toBe("12345678")
      await expect(execute("1234567")).rejects.toThrow(
        '"value" length must be at least 8 characters long',
      )
    })

    it("supports maxLength", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        maxLength: 8,
      })
      expect(code).toMatchInlineSnapshot(
        '"const x = joi.string().max(8).required()"',
      )

      await expect(execute("12345678")).resolves.toBe("12345678")
      await expect(execute("123456789")).rejects.toThrow(
        '"value" length must be less than or equal to 8 characters long',
      )
    })

    it("supports pattern", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        pattern: '"pk/\\d+"',
      })
      expect(code).toMatchInlineSnapshot(
        '"const x = joi.string().pattern(new RegExp(\'"pk/\\\\d+"\')).required()"',
      )

      await expect(execute('"pk/1234"')).resolves.toBe('"pk/1234"')
      await expect(execute("pk/abcd")).rejects.toThrow(
        '"value" with value "pk/abcd" fails to match the required pattern: /"pk\\/\\d+"/',
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
      const {code, execute} = await getActualFromModel({
        ...base,
        default: "example",
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.string().default("example")"`,
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
        `"const x = joi.string().allow(null).default(null)"`,
      )

      await expect(execute(undefined)).resolves.toBeNull()
    })

    it("supports empty string default values", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        default: "",
      })

      expect(code).toMatchInlineSnapshot(`"const x = joi.string().default("")"`)

      await expect(execute(undefined)).resolves.toBe("")
    })

    it("supports default values with quotes", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        default: 'this is an "example", it\'s got lots of `quotes`',
      })

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
      const {code, execute} = await getActualFromModel({
        ...base,
        default: false,
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.string().default("false")"`,
      )

      await expect(execute(undefined)).resolves.toBe("false")
    })

    describe("formats", () => {
      it("supports email", async () => {
        const {code, execute} = await getActualFromModel({
          ...base,
          format: "email",
        })

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
        const {code, execute} = await getActualFromModel({
          ...base,
          format: "date-time",
        })

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
    })
  })

  describe("booleans", () => {
    const base: SchemaBoolean = {
      nullable: false,
      readOnly: false,
      type: "boolean",
    }

    it("supports plain boolean", async () => {
      const {code, execute} = await getActualFromModel({...base})

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
      const {code, execute} = await getActualFromModel({
        ...base,
        default: false,
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().truthy(1, "1").falsy(0, "0").default(false)"`,
      )

      await expect(execute(undefined)).resolves.toBe(false)
    })

    it("supports default values of true", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        default: true,
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().truthy(1, "1").falsy(0, "0").default(true)"`,
      )

      await expect(execute(undefined)).resolves.toBe(true)
    })

    it("supports default values of null when nullable", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        nullable: true,
        default: null,
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().truthy(1, "1").falsy(0, "0").allow(null).default(null)"`,
      )

      await expect(execute(undefined)).resolves.toBeNull()
    })

    it("support enum of 'true'", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        enum: ["true"],
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().truthy(1, "1").valid(true).required()"`,
      )

      await expect(execute(true)).resolves.toBe(true)
      await expect(execute(false)).rejects.toThrow('"value" must be [true]')
    })

    it("support enum of 'false'", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        enum: ["false"],
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.boolean().falsy(0, "0").valid(false).required()"`,
      )

      await expect(execute(false)).resolves.toBe(false)
      await expect(execute(true)).rejects.toThrow('"value" must be [false]')
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
      const {code, execute} = await getActualFromModel({
        ...base,
        uniqueItems: true,
      })

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
      const {code, execute} = await getActualFromModel({
        ...base,
        minItems: 2,
      })

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
      const {code, execute} = await getActualFromModel({
        ...base,
        maxItems: 2,
      })

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
      const {code, execute} = await getActualFromModel({
        ...base,
        items: schemaNumber(),
        minItems: 1,
        maxItems: 3,
        uniqueItems: true,
      })

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
      const {code, execute} = await getActualFromModel({
        ...base,
        default: ["example"],
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.array().items(joi.string()).default(["example"])"`,
      )

      await expect(execute(undefined)).resolves.toStrictEqual(["example"])
    })

    it("supports empty array default values", async () => {
      const {code, execute} = await getActualFromModel({
        ...base,
        default: [],
      })

      expect(code).toMatchInlineSnapshot(
        `"const x = joi.array().items(joi.string()).default([])"`,
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
      additionalProperties: false,
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
        '"const x = joi.object().pattern(joi.any(), joi.number().required()).required()"',
      )

      await expect(execute({key: 1})).resolves.toEqual({
        key: 1,
      })
      await expect(execute({key: "string"})).rejects.toThrow(
        '"key" must be a number',
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
  })

  describe("unions", () => {
    it("can union a string and number", async () => {
      const {code, execute} = await getActualFromModel(
        schemaObject({
          anyOf: [schemaString(), schemaNumber()],
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

    // TODO: https://github.com/hapijs/joi/issues/3057
    it.skip("can intersect unions", async () => {
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
          "const x = joi
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
            .required()
            .concat(
              joi
                .object()
                .keys({ id: joi.string().required() })
                .options({ stripUnknown: true })
                .required(),
            )
            .required()"
        `)

      await expect(execute({id: "1234", foo: "bla"})).resolves.toEqual({
        id: "1234",
        foo: "bla",
      })
      await expect(execute({id: "1234", bar: "bla"})).resolves.toEqual({
        id: "1234",
        bar: "bla",
      })
      await expect(execute({foo: "bla"})).rejects.toThrow("Required")
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

      expect(code).toMatchInlineSnapshot(`"const x = joi.any().required()"`)

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

      expect(code).toMatchInlineSnapshot(`
          "const x = joi
            .array()
            .items(joi.object().pattern(joi.any(), joi.any()))
            .required()"
        `)

      await expect(execute([{key: 1}])).resolves.toEqual([
        {
          key: 1,
        },
      ])
      await expect(execute({key: "string"})).rejects.toThrow(
        '"value" must be an array',
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
      expect(code).toMatchInlineSnapshot(
        `"const x = joi.object().keys({}).options({ stripUnknown: true }).required()"`,
      )
      await expect(execute({any: "object"})).resolves.toEqual({})
      await expect(execute("some string")).rejects.toThrow(
        '"value" must be of type object',
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

      expect(code).toMatchInlineSnapshot(`"const x = joi.any().required()"`)

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

      expect(code).toMatchInlineSnapshot(`
          "const x = joi
            .array()
            .items(joi.object().pattern(joi.any(), joi.any()))
            .required()"
        `)

      await expect(execute([{key: 1}])).resolves.toEqual([
        {
          key: 1,
        },
      ])
      await expect(execute({key: "string"})).rejects.toThrow(
        '"value" must be an array',
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
      expect(code).toMatchInlineSnapshot(
        `"const x = joi.object().keys({}).options({ stripUnknown: true }).required()"`,
      )
      await expect(execute({any: "object"})).resolves.toEqual({})
      await expect(execute("some string")).rejects.toThrow(
        '"value" must be of type object',
      )
    })
  })
})
