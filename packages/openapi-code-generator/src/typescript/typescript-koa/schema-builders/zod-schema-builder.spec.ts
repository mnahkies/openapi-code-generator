import {describe, it, expect} from "@jest/globals"
import {ZodBuilder} from "./zod-schema-builder"
import {unitTestInput} from "../../../test/input.test-utils"

describe("zod-schema-builder", () => {
  it("supports unions / oneOf", async () => {
    const {input, file} = await unitTestInput()
    const schema = input.schema({$ref: `${file}#components/schemas/OneOf`})

    const builder = new ZodBuilder("z", input)

    const actual = builder.fromModel(schema, true)

    expect(actual).toMatchInlineSnapshot(`
      "z.union([
      z.object({"strs": z.array(z.coerce.string())}),
      z.array(z.coerce.string()),
      z.coerce.string(),
      ])"
    `)
  })

  it("supports allOf", async () => {
    const {input, file} = await unitTestInput()
    const schema = input.schema({$ref: `${file}#components/schemas/AllOf`})

    const builder = new ZodBuilder("z", input)

    const actual = builder.fromModel(schema, true)

    expect(actual).toMatchInlineSnapshot(`
      "z.object({"name": z.coerce.string(),"breed": z.coerce.string().optional()})
      .merge(z.object({"id": z.coerce.number()}))"
    `)
  })
})
