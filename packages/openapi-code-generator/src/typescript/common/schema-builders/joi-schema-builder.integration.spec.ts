import vm from "node:vm"
import {beforeAll, describe, expect, it} from "@jest/globals"
import {testVersions} from "../../../test/input.test-utils"
import {TypescriptFormatterBiome} from "../typescript-formatter.biome"
import {
  type SchemaBuilderIntegrationTestHarness,
  schemaBuilderIntegrationTestHarness,
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

  let getActual: SchemaBuilderIntegrationTestHarness["getActual"]

  beforeAll(async () => {
    const formatter = await TypescriptFormatterBiome.createNodeFormatter()
    const harness = schemaBuilderIntegrationTestHarness(
      "joi",
      formatter,
      version,
      executeParseSchema,
    )

    getActual = harness.getActual
  })

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
              .required()
              .allow(null),
            nullableSingularOneOfRef: s_AString.required().allow(null),
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

          /**
           * Recursively re-distribute the type union/intersection such that joi can support it
           * Eg: from A & (B | C) to (A & B) | (A & C)
           * https://github.com/hapijs/joi/issues/3057
           */
          export function joiIntersect(
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
          export const s_AdditionalPropertiesMixed = joiIntersect(
            joi
              .object()
              .keys({ id: joi.string(), name: joi.string() })
              .options({ stripUnknown: true }),
            joi.object().pattern(joi.any(), joi.any()).required(),
          )
            .required()
            .id("s_AdditionalPropertiesMixed")"
        `)
    })
  })
})
