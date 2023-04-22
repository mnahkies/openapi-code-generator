import {describe, it, expect} from "@jest/globals"
import {unitTestInput} from "../../test/input.test-utils"
import {TypeBuilder} from "./type-builder"
import {ImportBuilder} from "./import-builder"
import {formatOutput} from "./output-utils"

describe("typescript/common/type-builder", () => {
  it("can build a type for a simple object correctly", async () => {
    const {type, schemas, imports} = await getActual(
      "components/schemas/SimpleObject"
    )

    expect(type).toMatchInlineSnapshot(`
      "const x: t_SimpleObject
      "
    `)

    expect(schemas).toMatchInlineSnapshot(`
      "export type t_SimpleObject = {
        date: string
        datetime: string
        num: number
        optional_str?: string
        required_nullable: string | null
        str: string
      }
      "
    `)

    expect(imports).toMatchInlineSnapshot(`
      "import { t_SimpleObject } from "models"
      "
    `)
  })

  it("can build a type for an object that references other objects correctly", async () => {
    const {type, schemas, imports} = await getActual(
      "components/schemas/ObjectWithRefs"
    )

    expect(type).toMatchInlineSnapshot(`
      "const x: t_ObjectWithRefs
      "
    `)

    expect(schemas).toMatchInlineSnapshot(`
      "export type t_SimpleObject = {
        date: string
        datetime: string
        num: number
        optional_str?: string
        required_nullable: string | null
        str: string
      }

      export type t_ObjectWithRefs = {
        optionalObject?: t_SimpleObject
        requiredObject: t_SimpleObject
      }
      "
    `)

    expect(imports).toMatchInlineSnapshot(`
      "import { t_ObjectWithRefs, t_SimpleObject } from "models"
      "
    `)
  })

  it("can build a type for a named nullable string enum", async () => {
    const {type, schemas, imports} = await getActual(
      "components/schemas/NamedNullableStringEnum"
    )

    expect(type).toMatchInlineSnapshot(`
      "const x: t_NamedNullableStringEnum
      "
    `)

    expect(schemas).toMatchInlineSnapshot(`
      "export type t_NamedNullableStringEnum = "" | "one" | "two" | "three" | null
      "
    `)

    expect(imports).toMatchInlineSnapshot(`
      "import { t_NamedNullableStringEnum } from "models"
      "
    `)
  })

  it("can build a type for a oneOf correctly", async () => {
    const {type, schemas, imports} = await getActual(
      "components/schemas/OneOf"
    )

    expect(type).toMatchInlineSnapshot(`
      "const x: t_OneOf
      "
    `)

    expect(schemas).toMatchInlineSnapshot(`
      "export type t_OneOf =
        | {
            strs: string[]
          }
        | string[]
        | string
      "
    `)

    expect(imports).toMatchInlineSnapshot(`
      "import { t_OneOf } from "models"
      "
    `)
  })

  it("can build a type for a allOf correctly", async () => {
    const {type, schemas, imports} = await getActual(
      "components/schemas/AllOf"
    )

    expect(type).toMatchInlineSnapshot(`
      "const x: t_AllOf
      "
    `)

    expect(schemas).toMatchInlineSnapshot(`
      "export type t_Base = {
        breed?: string
        name: string
      }

      export type t_AllOf = t_Base & {
        id: number
      }
      "
    `)

    expect(imports).toMatchInlineSnapshot(`
      "import { t_AllOf, t_Base } from "models"
      "
    `)
  })

  async function getActual(path: string) {
    const {input, file} = await unitTestInput()
    const schema = {$ref: `${file}#${path}`}

    const imports = new ImportBuilder()

    const builder = TypeBuilder.fromInput("models.ts", input).withImports(
      imports
    )

    const type = builder.schemaObjectToType(schema)

    return {
      type: await formatOutput(`const x: ${type}`),
      schemas: await formatOutput(builder.toString()),
      imports: await formatOutput(imports.toString()),
    }
  }
})
