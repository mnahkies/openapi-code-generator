import {describe, it, expect} from "@jest/globals"
import {ZodBuilder} from "./zod-schema-builder"
import {unitTestInput} from "../../../test/input.test-utils"

describe("zod-schema-builder", () => {
  it("supports unions / oneOf", async () => {
    const {input, file} = await unitTestInput()
    const schema = input.schema({$ref: `${file}#components/schemas/OneOf`})

    const builder = new ZodBuilder("zod", input)

    const actual = builder.fromModel(schema, true)

    expect(actual).toMatchInlineSnapshot(`
      "zod.union([
      zod.object({"strs": zod.array(zod.coerce.string())}),
      zod.array(zod.coerce.string()),
      zod.coerce.string(),
      ])"
    `)
  })

})
