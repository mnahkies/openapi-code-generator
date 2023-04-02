import {describe, it, expect} from "@jest/globals"
import {ZodBuilder} from "./zod-schema-builder"
import {unitTestInput} from "../../../test/input.test-utils"
import {ImportBuilder} from "../../common/import-builder"

describe("zod-schema-builder", () => {
  it("supports unions / oneOf", async () => {
    const {input, file} = await unitTestInput()
    const schema = input.schema({$ref: `${file}#components/schemas/OneOf`})

    const builder = new ZodBuilder(
      "z",
      "schemas.ts",
      input,
      new ImportBuilder()
    )

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

    const builder = new ZodBuilder(
      "z",
      "schemas.ts",
      input,
      new ImportBuilder()
    )

    const actual = builder.fromModel(schema, true)

    expect(actual).toMatchInlineSnapshot(`
      "s_Base
      .merge(z.object({"id": z.coerce.number()}))"
    `)

    expect(builder.toString()).toMatchInlineSnapshot(`
      "import {z} from 'zod'

        export const s_Base = z.object({"name": z.coerce.string(),"breed": z.coerce.string().optional()})
        "
    `)
  })
})
