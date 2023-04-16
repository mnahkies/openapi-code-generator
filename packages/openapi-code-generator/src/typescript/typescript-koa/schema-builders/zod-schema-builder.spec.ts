import {describe, it, expect} from "@jest/globals"
import {ZodBuilder} from "./zod-schema-builder"
import {unitTestInput} from "../../../test/input.test-utils"
import {ImportBuilder} from "../../common/import-builder"
import {formatOutput} from "../../common/output-utils"

describe("zod-schema-builder", () => {
  it("supports the SimpleObject", async () => {
    const {model, schemas} = await getActual(
      "components/schemas/SimpleObject"
    )

    expect(model).toMatchInlineSnapshot(`
      "s_SimpleObject
      "
    `)
    expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_SimpleObject = z.object({
        str: z.coerce.string(),
        num: z.coerce.number(),
        date: z.coerce.string(),
        datetime: z.coerce.string().datetime({ offset: true }),
        optional_str: z.coerce.string().optional(),
        required_nullable: z.coerce.string().nullable(),
      })
      "
    `)
  })

  it("supports unions / oneOf", async () => {
    const {model, schemas} = await getActual("components/schemas/OneOf")

    expect(model).toMatchInlineSnapshot(`
      "s_OneOf
      "
    `)
    expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_OneOf = z.union([
        z.object({ strs: z.array(z.coerce.string()) }),
        z.array(z.coerce.string()),
        z.coerce.string(),
      ])
      "
    `)
  })

  it("supports allOf", async () => {
    const {model, schemas} = await getActual("components/schemas/AllOf")

    expect(model).toMatchInlineSnapshot(`
      "s_AllOf
      "
    `)
    expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_Base = z.object({
        name: z.coerce.string(),
        breed: z.coerce.string().optional(),
      })

      export const s_AllOf = s_Base.merge(z.object({ id: z.coerce.number() }))
      "
    `)
  })

  it("orders schemas such that dependencies are defined first", async () => {
    const {model, schemas} = await getActual("components/schemas/Ordering")

    expect(model).toMatchInlineSnapshot(`
      "s_Ordering
      "
    `)
    expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_AOrdering = z.object({ name: z.coerce.string().optional() })

      export const s_ZOrdering = z.object({
        name: z.coerce.string().optional(),
        dependency1: s_AOrdering,
      })

      export const s_Ordering = z.object({
        dependency1: s_ZOrdering,
        dependency2: s_AOrdering,
      })
      "
    `)
  })

  async function getActual(path: string) {
    const {input, file} = await unitTestInput()

    const builder = new ZodBuilder(
      "z",
      "schemas.ts",
      input,
      new ImportBuilder()
    )

    const model = builder.fromModel({$ref: `${file}#${path}`}, true)

    return {
      model: await formatOutput(model),
      schemas: await formatOutput(builder.toString()),
    }
  }
})
