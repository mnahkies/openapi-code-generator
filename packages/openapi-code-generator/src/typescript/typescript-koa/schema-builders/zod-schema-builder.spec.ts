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
      "z.object({
        str: z.coerce.string(),
        num: z.coerce.number(),
        date: z.coerce.string(),
        datetime: z.coerce.string().datetime({ offset: true }),
        optional_str: z.coerce.string().optional(),
        required_nullable: z.coerce.string().nullable(),
      })
      "
    `)
    expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"
      "
    `)
  })

  it("supports unions / oneOf", async () => {
    const {model, schemas} = await getActual("components/schemas/OneOf")

    expect(model).toMatchInlineSnapshot(`
      "z.union([
        z.object({ strs: z.array(z.coerce.string()) }),
        z.array(z.coerce.string()),
        z.coerce.string(),
      ])
      "
    `)
    expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"
      "
    `)
  })

  it("supports allOf", async () => {
    const {model, schemas} = await getActual("components/schemas/AllOf")

    expect(model).toMatchInlineSnapshot(`
      "s_Base.merge(z.object({ id: z.coerce.number() }))
      "
    `)
    expect(schemas).toMatchInlineSnapshot(`
      "import { z } from "zod"

      export const s_Base = z.object({
        name: z.coerce.string(),
        breed: z.coerce.string().optional(),
      })
      "
    `)
  })

  async function getActual(path: string) {
    const {input, file} = await unitTestInput()
    const schema = input.schema({$ref: `${file}#${path}`})

    const builder = new ZodBuilder(
      "z",
      "schemas.ts",
      input,
      new ImportBuilder()
    )

    const model = builder.fromModel(schema, true)

    return {
      model: await formatOutput(model),
      schemas: await formatOutput(builder.toString()),
    }
  }
})
