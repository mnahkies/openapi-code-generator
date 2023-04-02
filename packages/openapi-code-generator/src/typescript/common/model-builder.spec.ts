import { describe, beforeAll, it, expect } from "@jest/globals"
import { unitTestInput } from "../../test/input.test-utils"
import { Input } from "../../core/input"
import { ModelBuilder } from "./model-builder"

describe("typescript/common/model-builder", () => {
  let input: Input
  let file: string

  beforeAll(async () => {
    const result = await unitTestInput()

    input = result.input
    file = result.file
  })

  it("can build a type for a simple object correctly", async () => {
    const builder = ModelBuilder.fromInput("models.ts", input)

    const actual = builder.schemaObjectToType(
      input.schema({ $ref: `${file}#/components/schemas/SimpleObject` })
    )

    expect(actual).toMatchInlineSnapshot(`
      "{
      "date" : string ;
      "datetime" : string ;
      "num" : number ;
      "optional_str" ? : string ;
      "str" : string ;
      }"
    `)
  })

  it("can build a type for an object that references other objects correctly", async () => {
    const builder = ModelBuilder.fromInput("models.ts", input)

    const actual = builder.schemaObjectToType(
      input.schema({ $ref: `${file}#/components/schemas/ObjectWithRefs` })
    )

    expect(actual).toMatchInlineSnapshot(`
      "{
      "optionalObject" ? : t_SimpleObject ;
      "requiredObject" : t_SimpleObject ;
      }"
    `)
  })

  it("can build a type for a oneOf correctly", async () => {
    const builder = ModelBuilder.fromInput("models.ts", input)

    const actual = builder.schemaObjectToType(
      input.schema({ $ref: `${file}#/components/schemas/OneOf` })
    )

    expect(actual).toMatchInlineSnapshot(`
      "({
      "strs" : string[] ;
      }
       | string[]
       | string)"
    `)
  })

  it("can build a type for a allOf correctly", async () => {
    const builder = ModelBuilder.fromInput("models.ts", input)

    const actual = builder.schemaObjectToType(
      input.schema({ $ref: `${file}#/components/schemas/AllOf` })
    )

    expect(actual).toMatchInlineSnapshot(`
      "(t_Base & {
      "id" : number ;
      })"
    `)
  })
})
