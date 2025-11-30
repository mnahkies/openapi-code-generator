import {describe, expect, it} from "@jest/globals"
import {generationLib} from "./generation-lib"
import {SchemaNormalizer} from "./input"
import type {
  IRModelAny,
  IRModelArray,
  IRModelBoolean,
  IRModelNever,
  IRModelNumeric,
  IRModelObject,
  IRModelString,
} from "./openapi-types-normalized"

describe("core/input - SchemaNormalizer", () => {
  const base = {
    any: {
      type: "any",
      default: undefined,
      nullable: false,
      readOnly: false,
      "x-internal-preprocess": undefined,
    } satisfies IRModelAny,
    never: {
      type: "never",
      default: undefined,
      nullable: false,
      readOnly: false,
      "x-internal-preprocess": undefined,
    } satisfies IRModelNever,
    object: {
      type: "object",
      default: undefined,
      nullable: false,
      readOnly: false,
      properties: {},
      required: [],
      allOf: [],
      oneOf: [],
      anyOf: [],
      additionalProperties: false,
      "x-internal-preprocess": undefined,
    } satisfies IRModelObject,
    array: {
      type: "array",
      default: undefined,
      nullable: false,
      readOnly: false,
      uniqueItems: false,
      minItems: undefined,
      maxItems: undefined,
      "x-internal-preprocess": undefined,
    } satisfies Omit<IRModelArray, "items">,
    string: {
      type: "string",
      format: undefined,
      default: undefined,
      enum: undefined,
      maxLength: undefined,
      minLength: undefined,
      nullable: false,
      pattern: undefined,
      readOnly: false,
      "x-enum-extensibility": undefined,
      "x-internal-preprocess": undefined,
    } satisfies IRModelString,
    number: {
      type: "number",
      format: undefined,
      default: undefined,
      enum: undefined,
      exclusiveMaximum: undefined,
      exclusiveMinimum: undefined,
      maximum: undefined,
      minimum: undefined,
      multipleOf: undefined,
      nullable: false,
      readOnly: false,
      "x-enum-extensibility": undefined,
      "x-internal-preprocess": undefined,
    } satisfies IRModelNumeric,
    boolean: {
      type: "boolean",
      default: undefined,
      enum: undefined,
      nullable: false,
      readOnly: false,
      "x-internal-preprocess": undefined,
    } satisfies IRModelBoolean,
  }

  const schemaNormalizer = new SchemaNormalizer({
    extractInlineSchemas: true,
    enumExtensibility: "open",
  })

  it("passes through $ref untouched", () => {
    const ref = {$ref: "#/components/schemas/Thing"}
    const actual = schemaNormalizer.normalize(ref)
    expect(actual).toBe(ref)
  })

  it("throws on unknown types", () => {
    expect(() => {
      // @ts-expect-error testing bad input
      schemaNormalizer.normalize({type: "not a type"})
    }).toThrow("unsupported type 'not a type'")
  })

  describe("primitives", () => {
    describe("strings", () => {
      it("handles a basic string", () => {
        const actual = schemaNormalizer.normalize({type: "string"})
        expect(actual).toStrictEqual({...base.string})
      })

      it("handles a enum string", () => {
        const actual = schemaNormalizer.normalize({
          type: "string",
          enum: ["a", "b"],
        })
        expect(actual).toStrictEqual({
          ...base.string,
          enum: ["a", "b"],
          "x-enum-extensibility": "open",
        })
      })

      it("handles a nullable enum string", () => {
        const actual = schemaNormalizer.normalize({
          type: "string",
          enum: ["a", null, "b"],
        })
        expect(actual).toStrictEqual({
          ...base.string,
          nullable: true,
          enum: ["a", "b"],
          "x-enum-extensibility": "open",
        })
      })

      it("coerces invalid enum members to strings", () => {
        const actual = schemaNormalizer.normalize({
          type: "string",
          enum: ["a", 1, "b", false],
        })
        expect(actual).toStrictEqual({
          ...base.string,
          enum: ["a", "1", "b", "false"],
          "x-enum-extensibility": "open",
        })
      })

      it("ignores empty enum arrays", () => {
        const actual = schemaNormalizer.normalize({type: "string", enum: []})
        expect(actual).toStrictEqual({...base.string})
      })

      it("passes through string specific modifiers", () => {
        const actual = schemaNormalizer.normalize({
          type: "string",
          pattern: "^foo$",
          minLength: 1,
          maxLength: 10,
          format: "uri",
        })

        expect(actual).toStrictEqual({
          ...base.string,
          format: "uri",
          pattern: "^foo$",
          minLength: 1,
          maxLength: 10,
        })
      })
    })

    describe("numbers", () => {
      it("handles a basic number", () => {
        const actual = schemaNormalizer.normalize({type: "number"})
        expect(actual).toStrictEqual({...base.number})
      })

      it("maps integer to number", () => {
        const actual = schemaNormalizer.normalize({type: "integer"})
        expect(actual).toStrictEqual({...base.number})
      })

      it("handles an enum number", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          enum: [1, 2],
        })
        expect(actual).toStrictEqual({
          ...base.number,
          enum: [1, 2],
          "x-enum-extensibility": "open",
        })
      })

      it("handles an nullable enum number", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          enum: [1, 2, null],
        })
        expect(actual).toStrictEqual({
          ...base.number,
          nullable: true,
          enum: [1, 2],
          "x-enum-extensibility": "open",
        })
      })

      it("filters invalid enum members", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          enum: [1, "foo", true, 2],
        })
        expect(actual).toStrictEqual({
          ...base.number,
          enum: [1, 2],
          "x-enum-extensibility": "open",
        })
      })

      it("ignores empty enum arrays", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          enum: ["foo"],
        })
        expect(actual).toStrictEqual({...base.number})
      })

      it("passes through number specific modifiers", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          format: "int64",
          multipleOf: 2,
          maximum: 4,
          minimum: -2,
          exclusiveMaximum: 5,
          exclusiveMinimum: -3,
        })
        expect(actual).toStrictEqual({
          ...base.number,
          format: "int64",
          multipleOf: 2,
          maximum: 4,
          minimum: -2,
          exclusiveMaximum: 5,
          exclusiveMinimum: -3,
        })
      })

      // todo: implement
      it.skip("handles openapi 3.0 boolean exclusiveMaximum / exclusiveMinimum modifiers (true)", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          format: "int64",
          multipleOf: 2,
          maximum: 4,
          minimum: -2,
          exclusiveMaximum: true,
          exclusiveMinimum: true,
        })

        expect(actual).toStrictEqual({
          ...base.number,
          format: "int64",
          multipleOf: 2,
          exclusiveMaximum: 4,
          exclusiveMinimum: -2,
        })
      })

      // todo: implement
      it.skip("handles openapi 3.0 boolean exclusiveMaximum / exclusiveMinimum modifiers (false)", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          format: "int64",
          multipleOf: 2,
          maximum: 4,
          minimum: -2,
          exclusiveMaximum: false,
          exclusiveMinimum: false,
        })

        expect(actual).toStrictEqual({
          ...base.number,
          format: "int64",
          multipleOf: 2,
          inclusiveMaximum: 4,
          inclusiveMinimum: -2,
        })
      })
    })

    describe("booleans", () => {
      it("handles a basic boolean", () => {
        const actual = schemaNormalizer.normalize({type: "boolean"})
        expect(actual).toStrictEqual({...base.boolean})
      })

      it("normalizes boolean enum values to lowercase strings and respects nullable", () => {
        const actual = schemaNormalizer.normalize({
          type: "boolean",
          enum: ["TRUE", "False", null],
        })
        expect(actual).toStrictEqual({
          ...base.boolean,
          enum: ["true", "false"],
          nullable: true,
        })
      })

      it("ignores empty enum arrays", () => {
        const actual = schemaNormalizer.normalize({type: "boolean", enum: []})
        expect(actual).toStrictEqual({...base.boolean})
      })
    })
  })

  describe("custom types", () => {
    it("handles type: any", () => {
      const actual = schemaNormalizer.normalize({type: "any"})
      expect(actual).toStrictEqual({...base.any})
    })

    it("handles type: never", () => {
      const actual = schemaNormalizer.normalize({type: "never"})
      expect(actual).toStrictEqual({...base.never})
    })
  })

  describe("arrays", () => {
    it("handles a primitive array", () => {
      const actual = schemaNormalizer.normalize({
        type: "array",
        items: {type: "string"},
      })

      expect(actual).toStrictEqual({
        ...base.array,
        items: {...base.string},
      })
    })

    it("replaces missing items with UnknownObject$Ref", () => {
      const actual = schemaNormalizer.normalize({
        type: "array",
      })

      expect(actual).toStrictEqual({
        ...base.array,
        items: {$ref: generationLib.UnknownObject$Ref},
      })
    })
  })

  describe("objects", () => {
    it("filters required fields not present in properties", () => {
      const actual = schemaNormalizer.normalize({
        type: "object",
        properties: {a: {type: "string"}},
        required: ["a", "missing"],
      })
      expect(actual).toStrictEqual({
        ...base.object,
        type: "object",
        properties: {
          a: {
            ...base.string,
          },
        },
        required: ["a"],
      })
    })

    it("normalizes allOf entries and infers nullable when a null branch is present", () => {
      const actual = schemaNormalizer.normalize({
        type: "object",
        allOf: [
          {type: "string"},
          {type: "null"},
          {$ref: "#/components/schemas/Thing"},
        ],
      })

      expect(actual).toStrictEqual({
        ...base.object,
        nullable: true,
        allOf: [{...base.string}, {$ref: "#/components/schemas/Thing"}],
      })
    })

    it("normalizes oneOf entries and infers nullable when a null branch is present", () => {
      const actual = schemaNormalizer.normalize({
        type: "object",
        oneOf: [
          {type: "number"},
          {type: "null"},
          {$ref: "#/components/schemas/RefModel"},
        ],
      })

      expect(actual).toStrictEqual({
        ...base.object,
        nullable: true,
        oneOf: [{...base.number}, {$ref: "#/components/schemas/RefModel"}],
      })
    })

    it("normalizes anyOf entries, filters unsupported/nullable branches, and infers nullable", () => {
      const actual = schemaNormalizer.normalize({
        type: "object",
        anyOf: [
          {type: "number"},
          {type: "null"},
          {},
          {$ref: "#/components/schemas/Another"},
        ],
      })

      expect(actual).toStrictEqual({
        ...base.object,
        nullable: true,
        anyOf: [{...base.number}, {$ref: "#/components/schemas/Another"}],
      })
    })
  })

  describe("empty schemas / additionalProperties", () => {
    it("translates '{}' to an any", () => {
      const actual = schemaNormalizer.normalize({})
      expect(actual).toStrictEqual({...base.any})
    })

    it("translates 'type: object' to a Record<string, any>", () => {
      const actual = schemaNormalizer.normalize({type: "object"})
      expect(actual).toStrictEqual({...base.object, additionalProperties: true})
    })

    // todo: fix
    it.skip("translates 'type: object' with a description to a Record<string, any>", () => {
      const actual = schemaNormalizer.normalize({
        type: "object",
        description: "something",
      })
      expect(actual).toStrictEqual({...base.object, additionalProperties: true})
    })

    it("translates '{additionalProperties: false} to an record of never", () => {
      const actual = schemaNormalizer.normalize({
        additionalProperties: false,
      })

      expect(actual).toStrictEqual({
        ...base.object,
        additionalProperties: false,
      })
    })
  })

  describe("openapi 3.2", () => {
    it("translates a type array to oneOf and preserves nullable", () => {
      const actual = schemaNormalizer.normalize({
        type: ["string", "number", "null"],
      })

      expect(actual).toStrictEqual({
        ...base.object,
        oneOf: [
          {...base.string, nullable: true},
          {...base.number, nullable: true},
        ],
      })
    })
  })
})
