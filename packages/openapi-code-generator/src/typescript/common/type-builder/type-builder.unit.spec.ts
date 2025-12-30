import {beforeAll, beforeEach, describe, expect, it} from "@jest/globals"
import type {ISchemaProvider} from "../../../core/input"
import type {CompilerOptions} from "../../../core/loaders/tsconfig.loader"
import type {
  IRModel,
  IRRef,
  MaybeIRModel,
} from "../../../core/openapi-types-normalized"
import {isRef} from "../../../core/openapi-utils"
import {irFixture as ir} from "../../../test/ir-model.fixtures.test-utils"
import {TypescriptFormatterBiome} from "../typescript-formatter.biome"
import type {TypeBuilderConfig} from "./type-builder"
import {
  type TypeBuilderTestHarness,
  typeBuilderTestHarness,
} from "./type-builder.test-utils"

class FakeSchemaProvider implements ISchemaProvider {
  private readonly testRefs: Record<string, IRModel> = {}

  registerTestRef(ref: IRRef, model: IRModel) {
    this.testRefs[ref.$ref] = model
  }

  schema(maybeRef: MaybeIRModel): IRModel {
    if (isRef(maybeRef)) {
      const result = this.testRefs[maybeRef.$ref]

      if (!result) {
        throw new Error(
          `FakeSchemaProvider: $ref '${maybeRef.$ref}' is not registered`,
        )
      }

      return result
    }

    return maybeRef
  }
}

describe("typescript/common/type-builder - unit tests", () => {
  let formatter: TypescriptFormatterBiome
  let schemaProvider: FakeSchemaProvider
  let testHarness: TypeBuilderTestHarness

  beforeAll(async () => {
    formatter = await TypescriptFormatterBiome.createNodeFormatter()
    testHarness = typeBuilderTestHarness(formatter)
  })

  beforeEach(async () => {
    schemaProvider = new FakeSchemaProvider()
  })

  describe("$ref", () => {
    it("will convert a $ref to a name and emit the referenced type", async () => {
      const ref = ir.ref("/components/schemas/User")
      schemaProvider.registerTestRef(
        ref,
        ir.object({properties: {username: ir.string()}}),
      )

      const {code, types} = await getActual(
        ir.object({properties: {user: ref}}),
      )

      expect(types).toMatchInlineSnapshot(`
        "export type t_User = {
          username?: string
        }"
      `)
      expect(code).toMatchInlineSnapshot(`
        "import type { t_User } from "./unit-test.types"

        declare const x: {
          user?: t_User
        }"
      `)
    })
  })

  describe("strings", () => {
    it("handles a basic string", async () => {
      const {code} = await getActual(ir.string())
      expect(code).toMatchInlineSnapshot(`"declare const x: string"`)
    })

    it("handles a nullable string", async () => {
      const {code} = await getActual(ir.string({nullable: true}))
      expect(code).toMatchInlineSnapshot(`"declare const x: string | null"`)
    })

    it("handles a 'closed' enum string", async () => {
      const {code} = await getActual(
        ir.string({
          enum: ["one", "two", "three"],
          "x-enum-extensibility": "closed",
        }),
      )
      expect(code).toMatchInlineSnapshot(
        `"declare const x: "one" | "two" | "three""`,
      )
    })

    it("handles a 'open' enum string", async () => {
      const {code} = await getActual(
        ir.string({
          enum: ["one", "two", "three"],
          "x-enum-extensibility": "open",
        }),
      )
      expect(code).toMatchInlineSnapshot(`
        "import type { UnknownEnumStringValue } from "./unit-test.types"

        declare const x: "one" | "two" | "three" | UnknownEnumStringValue"
      `)
    })

    it("handles a nullable enum string", async () => {
      const {code} = await getActual(
        ir.string({nullable: true, enum: ["foo", "bar"]}),
      )
      expect(code).toMatchInlineSnapshot(
        `"declare const x: "foo" | "bar" | null"`,
      )
    })

    it("handles a binary format string", async () => {
      const {code} = await getActual(ir.string({format: "binary"}))

      expect(code).toMatchInlineSnapshot(`"declare const x: Blob"`)
    })
  })

  describe("numbers", () => {
    it("handles a basic number", async () => {
      const {code} = await getActual(ir.number())
      expect(code).toMatchInlineSnapshot(`"declare const x: number"`)
    })

    it("handles a nullable number", async () => {
      const {code} = await getActual(ir.number({nullable: true}))
      expect(code).toMatchInlineSnapshot(`"declare const x: number | null"`)
    })

    it("handles a 'closed' enum number", async () => {
      const {code} = await getActual(
        ir.number({
          enum: [1, 2, 3],
          "x-enum-extensibility": "closed",
        }),
      )
      expect(code).toMatchInlineSnapshot(`"declare const x: 1 | 2 | 3"`)
    })

    it("handles a 'open' enum number", async () => {
      const {code} = await getActual(
        ir.number({
          enum: [1, 2, 3],
          "x-enum-extensibility": "open",
        }),
      )
      expect(code).toMatchInlineSnapshot(`
        "import type { UnknownEnumNumberValue } from "./unit-test.types"

        declare const x: 1 | 2 | 3 | UnknownEnumNumberValue"
      `)
    })

    it("handles a nullable enum number", async () => {
      const {code} = await getActual(
        ir.number({nullable: true, enum: [10, 12]}),
      )
      expect(code).toMatchInlineSnapshot(`"declare const x: 10 | 12 | null"`)
    })
  })

  describe("booleans", () => {
    it("handles a basic boolean", async () => {
      const {code} = await getActual(ir.boolean())
      expect(code).toMatchInlineSnapshot(`"declare const x: boolean"`)
    })

    it("handles a nullable boolean", async () => {
      const {code} = await getActual(ir.boolean({nullable: true}))
      expect(code).toMatchInlineSnapshot(`"declare const x: boolean | null"`)
    })

    it("handles a enum boolean (true)", async () => {
      const {code} = await getActual(ir.boolean({enum: ["true"]}))
      expect(code).toMatchInlineSnapshot(`"declare const x: true"`)
    })

    it("handles a enum boolean (false)", async () => {
      const {code} = await getActual(ir.boolean({enum: ["false"]}))
      expect(code).toMatchInlineSnapshot(`"declare const x: false"`)
    })

    it("handles a nullable enum boolean", async () => {
      const {code} = await getActual(
        ir.boolean({enum: ["false"], nullable: true}),
      )
      expect(code).toMatchInlineSnapshot(`"declare const x: false | null"`)
    })
  })

  describe("objects", () => {
    it("handles a basic object", async () => {
      const {code} = await getActual(
        ir.object({
          properties: {
            a: ir.string(),
            b: ir.number(),
            c: ir.boolean({nullable: true}),
            d: ir.boolean({nullable: true}),
          },
          required: ["a", "d"],
        }),
      )
      expect(code).toMatchInlineSnapshot(`
        "declare const x: {
          a: string
          b?: number
          c?: boolean | null
          d: boolean | null
        }"
      `)
    })

    it("handles a nullable object", async () => {
      const {code} = await getActual(
        ir.object({
          properties: {
            a: ir.string(),
          },
          nullable: true,
        }),
      )
      expect(code).toMatchInlineSnapshot(`
        "declare const x: {
          a?: string
        } | null"
      `)
    })

    it("handles an object with additionalProperties", async () => {
      const {code} = await getActual(
        ir.object({
          properties: {
            a: ir.number(),
          },
          // todo: a Record<string, string> here will cause a typescript error for conflicting with `a`
          //       we should probably detect this earlier, and raise a more user friendly error at
          //       the input processing level
          additionalProperties: ir.record({value: ir.number()}),
        }),
      )
      expect(code).toMatchInlineSnapshot(`
        "declare const x: {
          a?: number
          [key: string]: number | undefined
        }"
      `)
    })

    it("handles nested objects", async () => {
      const {code} = await getActual(
        ir.object({
          properties: {
            a: ir.object({
              properties: {
                b: ir.string(),
              },
              required: ["b"],
            }),
          },
          required: ["a"],
        }),
      )
      expect(code).toMatchInlineSnapshot(`
        "declare const x: {
          a: {
            b: string
          }
        }"
      `)
    })

    it("handles objects with nullable properties", async () => {
      const {code} = await getActual(
        ir.object({
          properties: {
            a: ir.string({nullable: true}),
          },
          required: ["a"],
        }),
      )
      expect(code).toMatchInlineSnapshot(`
        "declare const x: {
          a: string | null
        }"
      `)
    })

    it("handles objects with properties that are arrays of objects", async () => {
      const {code} = await getActual(
        ir.object({
          properties: {
            a: ir.array({
              items: ir.object({
                properties: {
                  b: ir.string(),
                },
              }),
            }),
          },
        }),
      )
      expect(code).toMatchInlineSnapshot(`
        "declare const x: {
          a?: {
            b?: string
          }[]
        }"
      `)
    })
  })

  describe("records", () => {
    it("handles a basic record", async () => {
      const {code} = await getActual(
        ir.record({
          value: ir.string(),
        }),
      )
      expect(code).toMatchInlineSnapshot(
        `"declare const x: Record<string, string>"`,
      )
    })

    it("handles a nullable record", async () => {
      const {code} = await getActual(
        ir.record({
          value: ir.string(),
          nullable: true,
        }),
      )
      expect(code).toMatchInlineSnapshot(
        `"declare const x: Record<string, string> | null"`,
      )
    })
  })

  describe("arrays", () => {
    it("handles a basic array", async () => {
      const {code} = await getActual(ir.array({items: ir.string()}))
      expect(code).toMatchInlineSnapshot(`"declare const x: string[]"`)
    })

    it("handles a nullable array", async () => {
      const {code} = await getActual(
        ir.array({items: ir.string(), nullable: true}),
      )
      expect(code).toMatchInlineSnapshot(`"declare const x: string[] | null"`)
    })

    it("handles an array of objects", async () => {
      const {code} = await getActual(
        ir.array({
          items: ir.object({
            properties: {
              a: ir.string(),
            },
            required: ["a"],
          }),
        }),
      )
      expect(code).toMatchInlineSnapshot(`
        "declare const x: {
          a: string
        }[]"
      `)
    })

    it("handles an array with nullable items", async () => {
      const {code} = await getActual(
        ir.array({
          items: ir.string({nullable: true}),
        }),
      )
      expect(code).toMatchInlineSnapshot(`"declare const x: (string | null)[]"`)
    })

    it("handles nested arrays", async () => {
      const {code} = await getActual(
        ir.array({
          items: ir.array({
            items: ir.string(),
          }),
        }),
      )
      expect(code).toMatchInlineSnapshot(`"declare const x: string[][]"`)
    })
  })

  describe("any", () => {
    it("converts into 'any' when allowAny: true", async () => {
      const {code} = await getActual(ir.any(), {
        config: {allowAny: true},
      })
      expect(code).toMatchInlineSnapshot(`"declare const x: any"`)
    })

    it("converts into 'unknown' when allowAny: false", async () => {
      const {code} = await getActual(ir.any(), {
        config: {allowAny: false},
      })
      expect(code).toMatchInlineSnapshot(`"declare const x: unknown"`)
    })

    it("ignores nullability", async () => {
      const {code} = await getActual(ir.any({nullable: true}), {
        config: {allowAny: false},
      })
      expect(code).toMatchInlineSnapshot(`"declare const x: unknown"`)
    })
  })

  describe("never", () => {
    it("handles never", async () => {
      const {code} = await getActual(ir.never())
      expect(code).toMatchInlineSnapshot(`"declare const x: never"`)
    })
  })

  describe("intersections / unions", () => {
    it("can handle a basic A | B", async () => {
      const {code} = await getActual(
        ir.union({
          schemas: [ir.string(), ir.number()],
        }),
      )

      expect(code).toMatchInlineSnapshot(`"declare const x: string | number"`)
    })

    it("can unwrap & deduplicate a nested union into A | B | C", async () => {
      const {code} = await getActual(
        ir.union({
          schemas: [
            ir.string(),
            ir.union({
              schemas: [ir.string(), ir.number(), ir.boolean()],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(
        `"declare const x: string | number | boolean"`,
      )
    })

    it("can flatten a union into A", async () => {
      const {code} = await getActual(
        ir.union({
          schemas: [
            ir.string(),
            ir.union({
              schemas: [ir.string(), ir.string()],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`"declare const x: string"`)
    })

    it("can handle a basic A & B", async () => {
      const {code} = await getActual(
        ir.intersection({
          schemas: [
            ir.object({properties: {a: ir.string()}}),
            ir.object({properties: {b: ir.string()}}),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "declare const x: {
            a?: string
          } & {
            b?: string
          }"
        `)
    })

    it("can unnest a basic A & B & C", async () => {
      const {code} = await getActual(
        ir.intersection({
          schemas: [
            ir.object({properties: {a: ir.string()}}),
            ir.intersection({
              schemas: [
                ir.object({properties: {b: ir.string()}}),
                ir.object({properties: {c: ir.string()}}),
              ],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "declare const x: {
            a?: string
          } & {
            b?: string
          } & {
            c?: string
          }"
        `)
    })

    it("can handle intersecting an object with a union A & (B | C)", async () => {
      const {code} = await getActual(
        ir.intersection({
          schemas: [
            ir.object({
              properties: {base: ir.string()},
              required: ["base"],
            }),
            ir.union({
              schemas: [
                ir.object({
                  properties: {a: ir.number()},
                  required: ["a"],
                }),
                ir.object({
                  properties: {a: ir.string()},
                  required: ["a"],
                }),
              ],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "declare const x: {
            base: string
          } & (
            | {
                a: number
              }
            | {
                a: string
              }
          )"
        `)
    })

    it("can handle intersecting an union with a union (A | B) & (D | C)", async () => {
      const {code} = await getActual(
        ir.intersection({
          schemas: [
            ir.union({
              schemas: [
                ir.object({
                  properties: {a: ir.number()},
                  required: ["a"],
                }),
                ir.object({
                  properties: {a: ir.string()},
                  required: ["a"],
                }),
              ],
            }),
            ir.union({
              schemas: [
                ir.object({
                  properties: {a: ir.number()},
                  required: ["b"],
                }),
                ir.object({
                  properties: {a: ir.string()},
                  required: ["b"],
                }),
              ],
            }),
          ],
        }),
      )

      expect(code).toMatchInlineSnapshot(`
          "declare const x: (
            | {
                a: number
              }
            | {
                a: string
              }
          ) &
            (
              | {
                  a?: number
                }
              | {
                  a?: string
                }
            )"
        `)
    })
  })

  it("throws if accidentally passed a 'null' type", async () => {
    await expect(getActual(ir.null())).rejects.toThrow(
      "unreachable - 'null' types should be normalized out by SchemaNormalizer",
    )
  })

  it("throws if passed a garbage type", async () => {
    await expect(
      getActual({type: "rubbish"} as unknown as IRModel),
    ).rejects.toThrow(`unsupported type '{
  "type": "rubbish"
}'`)
  })

  async function getActual(
    schema: IRModel,
    {
      config = {allowAny: false},
      compilerOptions = {exactOptionalPropertyTypes: false},
    }: {
      config?: TypeBuilderConfig
      compilerOptions?: CompilerOptions
    } = {},
  ) {
    return testHarness.getActual(schema, schemaProvider, {
      config,
      compilerOptions,
    })
  }
})
