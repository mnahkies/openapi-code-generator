import {describe, expect, it} from "@jest/globals"
import {irFixture as ir} from "../test/ir-model.fixtures.test-utils"
import {generationLib} from "./generation-lib"
import {SchemaNormalizer} from "./input"

describe("core/input - SchemaNormalizer", () => {
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
        expect(actual).toStrictEqual(ir.string())
      })

      it("handles a enum string", () => {
        const actual = schemaNormalizer.normalize({
          type: "string",
          enum: ["a", "b"],
        })
        expect(actual).toStrictEqual(
          ir.string({
            enum: ["a", "b"],
            "x-enum-extensibility": "open",
          }),
        )
      })

      it("handles a nullable enum string", () => {
        const actual = schemaNormalizer.normalize({
          type: "string",
          enum: ["a", null, "b"],
        })
        expect(actual).toStrictEqual(
          ir.string({
            nullable: true,
            enum: ["a", "b"],
            "x-enum-extensibility": "open",
          }),
        )
      })

      it("coerces invalid enum members to strings", () => {
        const actual = schemaNormalizer.normalize({
          type: "string",
          enum: ["a", 1, "b", false],
        })
        expect(actual).toStrictEqual(
          ir.string({
            enum: ["a", "1", "b", "false"],
            "x-enum-extensibility": "open",
          }),
        )
      })

      it("ignores empty enum arrays", () => {
        const actual = schemaNormalizer.normalize({type: "string", enum: []})
        expect(actual).toStrictEqual(ir.string())
      })

      it("passes through string specific modifiers", () => {
        const actual = schemaNormalizer.normalize({
          type: "string",
          pattern: "^foo$",
          minLength: 1,
          maxLength: 10,
          format: "uri",
        })

        expect(actual).toStrictEqual(
          ir.string({
            format: "uri",
            pattern: "^foo$",
            minLength: 1,
            maxLength: 10,
          }),
        )
      })
    })

    describe("numbers", () => {
      it("handles a basic number", () => {
        const actual = schemaNormalizer.normalize({type: "number"})
        expect(actual).toStrictEqual(ir.number())
      })

      it("maps integer to number", () => {
        const actual = schemaNormalizer.normalize({type: "integer"})
        expect(actual).toStrictEqual(ir.number())
      })

      it("handles an enum number", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          enum: [1, 2],
        })
        expect(actual).toStrictEqual(
          ir.number({
            enum: [1, 2],
            "x-enum-extensibility": "open",
          }),
        )
      })

      it("handles an nullable enum number", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          enum: [1, 2, null],
        })
        expect(actual).toStrictEqual(
          ir.number({
            nullable: true,
            enum: [1, 2],
            "x-enum-extensibility": "open",
          }),
        )
      })

      it("filters invalid enum members", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          enum: [1, "foo", true, 2],
        })
        expect(actual).toStrictEqual(
          ir.number({
            enum: [1, 2],
            "x-enum-extensibility": "open",
          }),
        )
      })

      it("ignores empty enum arrays", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          enum: ["foo"],
        })
        expect(actual).toStrictEqual(ir.number())
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
        expect(actual).toStrictEqual(
          ir.number({
            format: "int64",
            multipleOf: 2,
            inclusiveMaximum: 4,
            inclusiveMinimum: -2,
            exclusiveMaximum: 5,
            exclusiveMinimum: -3,
          }),
        )
      })

      it("handles openapi 3.0 boolean exclusiveMaximum / exclusiveMinimum modifiers (true)", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          format: "int64",
          multipleOf: 2,
          maximum: 4,
          minimum: -2,
          exclusiveMaximum: true,
          exclusiveMinimum: true,
        })

        expect(actual).toStrictEqual(
          ir.number({
            format: "int64",
            multipleOf: 2,
            exclusiveMaximum: 4,
            exclusiveMinimum: -2,
          }),
        )
      })

      it("handles openapi 3.0 boolean exclusiveMaximum / exclusiveMinimum modifiers (false)", () => {
        const actual = schemaNormalizer.normalize({
          type: "number",
          format: "int64",
          multipleOf: 2,
          maximum: 4,
          minimum: -2,
          exclusiveMaximum: false,
          exclusiveMinimum: false,
        })

        expect(actual).toStrictEqual(
          ir.number({
            format: "int64",
            multipleOf: 2,
            inclusiveMaximum: 4,
            inclusiveMinimum: -2,
          }),
        )
      })
    })

    describe("booleans", () => {
      it("handles a basic boolean", () => {
        const actual = schemaNormalizer.normalize({type: "boolean"})
        expect(actual).toStrictEqual(ir.boolean())
      })

      it("normalizes boolean enum values to lowercase strings and respects nullable", () => {
        const actual = schemaNormalizer.normalize({
          type: "boolean",
          enum: ["TRUE", "False", null],
        })
        expect(actual).toStrictEqual(
          ir.boolean({
            enum: ["true", "false"],
            nullable: true,
          }),
        )
      })

      it("ignores empty enum arrays", () => {
        const actual = schemaNormalizer.normalize({type: "boolean", enum: []})
        expect(actual).toStrictEqual(ir.boolean())
      })
    })
  })

  describe("custom types", () => {
    it("handles type: any", () => {
      const actual = schemaNormalizer.normalize({type: "any"})
      expect(actual).toStrictEqual(ir.any())
    })

    it("handles type: never", () => {
      const actual = schemaNormalizer.normalize({type: "never"})
      expect(actual).toStrictEqual(ir.never())
    })
  })

  describe("arrays", () => {
    it("handles a primitive array", () => {
      const actual = schemaNormalizer.normalize({
        type: "array",
        items: {type: "string"},
      })

      expect(actual).toStrictEqual(
        ir.array({
          items: ir.string(),
        }),
      )
    })

    it("replaces missing items with UnknownObject$Ref", () => {
      const actual = schemaNormalizer.normalize({
        type: "array",
      })

      expect(actual).toStrictEqual(
        ir.array({
          items: {$ref: generationLib.UnknownObject$Ref},
        }),
      )
    })
  })

  describe("objects", () => {
    it("filters required fields not present in properties", () => {
      const actual = schemaNormalizer.normalize({
        type: "object",
        properties: {a: {type: "string"}},
        required: ["a", "missing"],
      })
      expect(actual).toStrictEqual(
        ir.object({
          type: "object",
          properties: {
            a: ir.string(),
          },
          required: ["a"],
        }),
      )
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

      expect(actual).toStrictEqual(
        ir.intersection({
          nullable: true,
          schemas: [ir.string(), {$ref: "#/components/schemas/Thing"}],
        }),
      )
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

      expect(actual).toStrictEqual(
        ir.union({
          nullable: true,
          schemas: [ir.number(), {$ref: "#/components/schemas/RefModel"}],
        }),
      )
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

      expect(actual).toStrictEqual(
        ir.union({
          nullable: true,
          schemas: [ir.number(), {$ref: "#/components/schemas/Another"}],
        }),
      )
    })

    it("lifts the raw schema properties into an allOf", () => {
      const actual = schemaNormalizer.normalize({
        type: "object",
        properties: {
          name: {type: "string"},
        },
        allOf: [
          {
            type: "object",
            properties: {
              id: {type: "string"},
            },
          },
        ],
      })

      expect(actual).toStrictEqual(
        ir.intersection({
          schemas: [
            ir.object({properties: {id: ir.string()}}),
            ir.object({properties: {name: ir.string()}}),
          ],
        }),
      )
    })

    it("lifts the raw schema properties into an allOf when combined with oneOf", () => {
      const actual = schemaNormalizer.normalize({
        type: "object",
        properties: {
          name: {type: "string"},
        },
        allOf: [
          {
            type: "object",
            properties: {
              id: {type: "string"},
            },
          },
        ],
        oneOf: [
          {type: "object", properties: {type: {enum: ["foo"]}}},
          {type: "object", properties: {type: {enum: ["bar"]}}},
        ],
      })

      expect(actual).toStrictEqual(
        ir.intersection({
          schemas: [
            ir.intersection({
              schemas: [
                ir.object({properties: {id: ir.string()}}),
                ir.object({properties: {name: ir.string()}}),
              ],
            }),
            ir.union({
              schemas: [
                ir.object({
                  properties: {
                    type: ir.string({
                      enum: ["foo"],
                      "x-enum-extensibility": "open",
                    }),
                  },
                }),
                ir.object({
                  properties: {
                    type: ir.string({
                      enum: ["bar"],
                      "x-enum-extensibility": "open",
                    }),
                  },
                }),
              ],
            }),
          ],
        }),
      )
    })

    it("handles concurrent use of allOf and oneOf", () => {
      const actual = schemaNormalizer.normalize({
        type: "object",
        properties: {
          name: {type: "string"},
        },
        oneOf: [
          {type: "object", properties: {type: {enum: ["foo"]}}},
          {type: "object", properties: {type: {enum: ["bar"]}}},
        ],
      })

      expect(actual).toStrictEqual(
        ir.intersection({
          schemas: [
            ir.object({properties: {name: ir.string()}}),
            ir.union({
              schemas: [
                ir.object({
                  properties: {
                    type: ir.string({
                      enum: ["foo"],
                      "x-enum-extensibility": "open",
                    }),
                  },
                }),
                ir.object({
                  properties: {
                    type: ir.string({
                      enum: ["bar"],
                      "x-enum-extensibility": "open",
                    }),
                  },
                }),
              ],
            }),
          ],
        }),
      )
    })
  })

  describe("empty schemas / additionalProperties", () => {
    it("translates '{}' to an any", () => {
      const actual = schemaNormalizer.normalize({})
      expect(actual).toStrictEqual(ir.any())
    })

    it("translates '{description: foo}' to an any", () => {
      const actual = schemaNormalizer.normalize({description: "foo"})
      expect(actual).toStrictEqual(ir.any())
    })

    it("translates 'type: object' to Record<string, any>", () => {
      const actual = schemaNormalizer.normalize({type: "object"})
      expect(actual).toStrictEqual(ir.record())
    })

    it("translates 'type: object' with a description to Record<string, any>", () => {
      const actual = schemaNormalizer.normalize({
        type: "object",
        description: "something",
      })
      expect(actual).toStrictEqual(ir.record())
    })

    it("translates '{additionalProperties: true}' to an Record<string, any>", () => {
      const actual = schemaNormalizer.normalize({
        additionalProperties: true,
      })

      expect(actual).toStrictEqual(ir.record())
    })

    it("translates '{additionalProperties: number}' to an Record<string, number>", () => {
      const actual = schemaNormalizer.normalize({
        additionalProperties: {type: "number"},
      })

      expect(actual).toStrictEqual(
        ir.record({
          key: ir.string(),
          value: ir.number(),
        }),
      )
    })

    it("translates '{additionalProperties: $ref}' to an Record<string, SomeClass>", () => {
      const actual = schemaNormalizer.normalize({
        additionalProperties: {$ref: "#/components/schemas/SomeClass"},
      })

      expect(actual).toStrictEqual(
        ir.record({
          key: ir.string(),
          value: {$ref: "#/components/schemas/SomeClass"},
        }),
      )
    })

    it("translates '{additionalProperties: false}' to an Record<string, never>", () => {
      const actual = schemaNormalizer.normalize({
        additionalProperties: false,
      })

      expect(actual).toStrictEqual(
        ir.record({
          key: ir.string(),
          value: ir.never(),
        }),
      )
    })

    it("translates an object with properties + additionalProperties", () => {
      const actual = schemaNormalizer.normalize({
        properties: {name: {type: "string"}},
        additionalProperties: true,
      })

      expect(actual).toStrictEqual(
        ir.object({
          properties: {name: ir.string()},
          additionalProperties: ir.record(),
        }),
      )
    })
  })

  describe("type: undefined", () => {
    it("detects a numeric enum", () => {
      const actual = schemaNormalizer.normalize({
        type: undefined,
        enum: [1, 2, 3],
      })

      expect(actual).toStrictEqual(
        ir.number({
          "x-enum-extensibility": "open",
          enum: [1, 2, 3],
        }),
      )
    })

    it("detects a boolean enum", () => {
      const actual = schemaNormalizer.normalize({
        type: undefined,
        enum: [true],
      })

      expect(actual).toStrictEqual(
        ir.boolean({
          enum: ["true"],
        }),
      )
    })

    it("detects a string enum", () => {
      const actual = schemaNormalizer.normalize({
        type: undefined,
        enum: ["foo", "bar"],
      })

      expect(actual).toStrictEqual(
        ir.string({
          "x-enum-extensibility": "open",
          enum: ["foo", "bar"],
        }),
      )
    })

    it("will fallback to assuming its an any, when nothing is present", () => {
      const actual = schemaNormalizer.normalize({})
      expect(actual).toStrictEqual(ir.any())
    })

    it("will fallback to assuming its an object, when properties are present", () => {
      const actual = schemaNormalizer.normalize({
        properties: {name: {type: "string"}},
      })
      expect(actual).toStrictEqual(
        ir.object({
          properties: {name: ir.string()},
        }),
      )
    })
  })

  describe("openapi 3.2", () => {
    it("translates a type array to oneOf and preserves nullable", () => {
      const actual = schemaNormalizer.normalize({
        type: ["string", "number", "null"],
      })

      expect(actual).toStrictEqual(
        ir.union({
          schemas: [ir.string({nullable: true}), ir.number({nullable: true})],
        }),
      )
    })
  })
})
