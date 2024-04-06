import vm from "node:vm"
import {describe, expect, it} from "@jest/globals"
import {IRModelNumeric} from "../../../core/openapi-types-normalized"
import {testVersions} from "../../../test/input.test-utils"
import {schemaBuilderTestHarness} from "./schema-builder.test-utils"

describe.each(testVersions)(
  "%s - typescript/common/schema-builders/joi-schema-builder",
  (version) => {
    const {getActual, getActualFromModel} = schemaBuilderTestHarness(
      "joi",
      version,
    )

    it("supports the SimpleObject", async () => {
      const {code, schemas} = await getActual("components/schemas/SimpleObject")

      expect(code).toMatchInlineSnapshot(`
        "import { s_SimpleObject } from "./unit-test.schemas"

        const x = s_SimpleObject.required()"
      `)

      expect(schemas).toMatchInlineSnapshot(`
        "import joi from "@hapi/joi"

        export const s_SimpleObject = joi
          .object()
          .keys({
            str: joi.string().required(),
            num: joi.number().required(),
            date: joi.string().required(),
            datetime: joi.string().required(),
            optional_str: joi.string(),
            required_nullable: joi.string().allow(null).required(),
          })
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
        "import joi from "@hapi/joi"

        export const s_AString = joi.string().required().id("s_AString")

        export const s_OneOf = joi
          .alternatives()
          .try(
            joi
              .object()
              .keys({ strs: joi.array().items(joi.string().required()).required() })
              .required(),
            joi.array().items(joi.string().required()).required(),
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
            nullableSingularOneOf: joi.boolean().allow(null),
            nullableSingularOneOfRef: s_AString.allow(null),
          })
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
        "import joi from "@hapi/joi"

        export const s_OneOf = joi
          .alternatives()
          .try(
            joi
              .object()
              .keys({ strs: joi.array().items(joi.string().required()).required() })
              .required(),
            joi.array().items(joi.string().required()).required(),
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
        "import joi from "@hapi/joi"

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
        "import joi from "@hapi/joi"

        export const s_Base = joi
          .object()
          .keys({ name: joi.string().required(), breed: joi.string() })
          .required()
          .id("s_Base")

        export const s_AllOf = s_Base
          .required()
          .concat(joi.object().keys({ id: joi.number().required() }).required())
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
        "import joi from "@hapi/joi"

        export const s_Recursive = joi
          .object()
          .keys({ child: joi.link("#s_Recursive") })
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
        "import joi from "@hapi/joi"

        export const s_AOrdering = joi
          .object()
          .keys({ name: joi.string() })
          .required()
          .id("s_AOrdering")

        export const s_ZOrdering = joi
          .object()
          .keys({ name: joi.string(), dependency1: s_AOrdering.required() })
          .required()
          .id("s_ZOrdering")

        export const s_Ordering = joi
          .object()
          .keys({
            dependency1: s_ZOrdering.required(),
            dependency2: s_AOrdering.required(),
          })
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
        "import joi from "@hapi/joi"

        export const s_Enums = joi
          .object()
          .keys({
            str: joi.string().valid("foo", "bar").allow(null),
            num: joi.number().valid(10, 20).allow(null),
          })
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
          "import joi from "@hapi/joi"

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
          "import joi from "@hapi/joi"

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
          "import joi from "@hapi/joi"

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
          "import joi from "@hapi/joi"

          export const s_NamedNullableStringEnum = joi
            .string()
            .valid("", "one", "two", "three")
            .allow(null)
            .required()
            .id("s_NamedNullableStringEnum")

          export const s_AdditionalPropertiesSchema = joi
            .object()
            .keys({ name: joi.string() })
            .concat(joi.object().pattern(joi.any(), s_NamedNullableStringEnum.required()))
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
          "import joi from "@hapi/joi"

          export const s_AdditionalPropertiesMixed = joi
            .object()
            .keys({ id: joi.string(), name: joi.string() })
            .concat(joi.object().pattern(joi.any(), joi.any()))
            .required()
            .id("s_AdditionalPropertiesMixed")"
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

        expect(code).toMatchInlineSnapshot(
          '"const x = joi.number().required()"',
        )
        await expect(executeParseSchema(code, 123)).resolves.toBe(123)
        await expect(
          executeParseSchema(code, "not a number 123"),
        ).rejects.toThrow('"value" must be a number')
      })

      it("supports enum number", async () => {
        const {code} = await getActualFromModel({
          ...base,
          enum: [200, 301, 404],
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = joi.number().valid(200, 301, 404).required()"',
        )

        await expect(executeParseSchema(code, 123)).rejects.toThrow(
          '"value" must be one of [200, 301, 404]',
        )
        await expect(executeParseSchema(code, 404)).resolves.toBe(404)
      })

      it("supports minimum", async () => {
        const {code} = await getActualFromModel({
          ...base,
          minimum: 10,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = joi.number().min(10).required()"',
        )

        await expect(executeParseSchema(code, 5)).rejects.toThrow(
          '"value" must be larger than or equal to 10',
        )
        await expect(executeParseSchema(code, 20)).resolves.toBe(20)
      })

      it("supports maximum", async () => {
        const {code} = await getActualFromModel({
          ...base,
          maximum: 16,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = joi.number().max(16).required()"',
        )

        await expect(executeParseSchema(code, 25)).rejects.toThrow(
          '"value" must be less than or equal to 16',
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
          '"const x = joi.number().min(10).max(24).required()"',
        )

        await expect(executeParseSchema(code, 5)).rejects.toThrow(
          '"value" must be larger than or equal to 10',
        )
        await expect(executeParseSchema(code, 25)).rejects.toThrow(
          '"value" must be less than or equal to 24',
        )
        await expect(executeParseSchema(code, 20)).resolves.toBe(20)
      })

      it("supports exclusiveMinimum", async () => {
        const {code} = await getActualFromModel({
          ...base,
          exclusiveMinimum: 4,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = joi.number().greater(4).required()"',
        )

        await expect(executeParseSchema(code, 4)).rejects.toThrow(
          '"value" must be greater than 4',
        )
        await expect(executeParseSchema(code, 20)).resolves.toBe(20)
      })

      it("supports exclusiveMaximum", async () => {
        const {code} = await getActualFromModel({
          ...base,
          exclusiveMaximum: 4,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = joi.number().less(4).required()"',
        )

        await expect(executeParseSchema(code, 4)).rejects.toThrow(
          '"value" must be less than 4',
        )
        await expect(executeParseSchema(code, 3)).resolves.toBe(3)
      })

      it("supports multipleOf", async () => {
        const {code} = await getActualFromModel({
          ...base,
          multipleOf: 4,
        })

        expect(code).toMatchInlineSnapshot(
          '"const x = joi.number().multiple(4).required()"',
        )

        await expect(executeParseSchema(code, 11)).rejects.toThrow(
          '"value" must be a multiple of 4',
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
          '"const x = joi.number().multiple(4).min(10).max(20).required()"',
        )

        await expect(executeParseSchema(code, 11)).rejects.toThrow(
          '"value" must be a multiple of 4',
        )
        await expect(executeParseSchema(code, 8)).rejects.toThrow(
          '"value" must be larger than or equal to 10',
        )
        await expect(executeParseSchema(code, 24)).rejects.toThrow(
          '"value" must be less than or equal to 20',
        )
        await expect(executeParseSchema(code, 16)).resolves.toBe(16)
      })

      it("supports 0", async () => {
        const {code} = await getActualFromModel({...base, minimum: 0})

        expect(code).toMatchInlineSnapshot(
          '"const x = joi.number().min(0).required()"',
        )

        await expect(executeParseSchema(code, -1)).rejects.toThrow(
          '"value" must be larger than or equal to 0',
        )
      })
    })

    async function executeParseSchema(code: string, input: unknown) {
      const context = {joi: require("@hapi/joi")}
      vm.createContext(context)
      return vm.runInContext(
        `
        ${code}

        const result = x.validate(${JSON.stringify(input)})

        if(result.error) {
          throw result.error
        }

        result.value
      `,
        context,
      )
    }
  },
)
