import {describe, expect, it} from "@jest/globals"
import type {ServerImplementationMethod} from "../../templates.types"
import {unitTestInput} from "../../test/input.test-utils"
import {ImportBuilder} from "../common/import-builder"
import {schemaBuilderFactory} from "../common/schema-builders/schema-builder"
import {TypeBuilder} from "../common/type-builder"
import {TypescriptFormatterBiome} from "../common/typescript-formatter.biome"
import {ServerRouterBuilder} from "./typescript-koa.generator"

describe("typescript/typescript-koa", () => {
  describe("ServerRouterBuilder#implementationExport", () => {
    it("can output implementation types as a `export type`", async () => {
      const actual = await getActual("type")
      // TODO: check result is actually valid typescript
      expect(actual).toMatchInlineSnapshot(`
        "export type UnitTestImplementation = {
          testOperation: TestOperation
          anotherTestOperation: AnotherTestOperation
        }
        "
      `)
    })

    it("can output implementation types as a `export interface`", async () => {
      const actual = await getActual("interface")

      expect(actual).toMatchInlineSnapshot(`
        "export interface UnitTestImplementation {
          testOperation: TestOperation
          anotherTestOperation: AnotherTestOperation
        }
        "
      `)
    })

    it("can output implementation types as a `export abstract class`", async () => {
      const actual = await getActual("abstract-class")
      expect(actual).toMatchInlineSnapshot(`
        "export abstract class UnitTestImplementation {
          abstract testOperation: TestOperation
          abstract anotherTestOperation: AnotherTestOperation
        }
        "
      `)
    })

    // TODO: proper test harness / refactor for testability
    async function getActual(
      serverImplementationMethod: ServerImplementationMethod,
    ) {
      const {input} = await unitTestInput("3.1.x")

      const formatter = await TypescriptFormatterBiome.createNodeFormatter()

      const imports = new ImportBuilder()
      const typeBuilder = await TypeBuilder.fromInput(
        "./unit-test.types.ts",
        input,
        {},
        {allowAny: true},
      )
      const schemaBuilder = await schemaBuilderFactory(
        "./unit-test.schemas.ts",
        input,
        "zod",
        {allowAny: true},
      )
      const serverRouterBuilder = new ServerRouterBuilder(
        "unit-test.ts",
        "unit-test",
        input,
        imports,
        typeBuilder,
        schemaBuilder,
        serverImplementationMethod,
      )

      serverRouterBuilder.add({
        method: "GET",
        parameters: [],
        servers: [],
        operationId: "testOperation",
        deprecated: false,
        summary: undefined,
        description: undefined,
        requestBody: undefined,
        responses: undefined,
        route: "",
        tags: [],
      })
      serverRouterBuilder.add({
        method: "GET",
        parameters: [],
        servers: [],
        operationId: "anotherTestOperation",
        deprecated: false,
        summary: undefined,
        description: undefined,
        requestBody: undefined,
        responses: undefined,
        route: "",
        tags: [],
      })

      return formatter.format(
        "unit-test.ts",
        serverRouterBuilder.implementationExport("UnitTestImplementation"),
      )
    }
  })
})
