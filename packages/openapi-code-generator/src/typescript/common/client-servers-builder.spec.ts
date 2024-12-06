import {describe, expect, it} from "@jest/globals"
import type {IROperation, IRServer} from "../../core/openapi-types-normalized"
import {ClientServersBuilder} from "./client-servers-builder"
import {ImportBuilder} from "./import-builder"
import {TypescriptFormatterBiome} from "./typescript-formatter.biome"

type TestResult = {
  output: string
  hasServers: boolean
  hasOperationServers: boolean
}

async function runTest(
  servers: IRServer[],
  operations: Pick<IROperation, "operationId" | "servers">[] = [],
) {
  const builder = new ClientServersBuilder(
    "unit-test.ts",
    "UnitTest",
    servers,
    new ImportBuilder(),
  )

  for (const it of operations) {
    builder.addOperation(it)
  }

  const formatter = await TypescriptFormatterBiome.createNodeFormatter()

  return {
    output: await formatter.format("unit-test.ts", builder.toString()),
    hasServers: builder.hasServers,
    hasOperationServers: builder.hasOperationServers,
  }
}

describe("typescript/common/client-servers-builder", () => {
  describe("no servers", () => {
    let result: TestResult

    beforeAll(async () => {
      result = await runTest([])
    })

    it("produces nothing", () => {
      expect(result.output).toMatchInlineSnapshot(`""`)
    })

    it("hasServers is false", () => {
      expect(result.hasServers).toBe(false)
    })

    it("hasOperationServers is false", () => {
      expect(result.hasOperationServers).toBe(false)
    })
  })

  describe("root servers, no operation servers", () => {
    let result: TestResult

    beforeAll(async () => {
      result = await runTest([
        {
          url: "{schema}://unit-tests-default.{tenant}.example.com",
          variables: {
            schema: {
              default: "https",
              enum: ["https", "http"],
              description: "The protocol to use",
            },
            tenant: {
              default: "example",
              enum: [],
              description: "Your tenant slug",
            },
          },
          description: "Default Unit test server",
        },
        {
          url: "https://unit-tests-other.example.com",
          variables: {},
          description: "Secondary Unit test server",
        },
      ])
    })

    it("produces a default, specific, and custom", () => {
      expect(result.output).toMatchInlineSnapshot(`
        "export class UnitTestServers {
          static default(
            schema: "https" | "http" = "https",
            tenant = "example",
          ): Server<"UnitTest"> {
            return "{schema}://unit-tests-default.{tenant}.example.com"
              .replace("{schema}", schema)
              .replace("{tenant}", tenant) as Server<"UnitTest">
          }

          static specific(
            url:
              | "{schema}://unit-tests-default.{tenant}.example.com"
              | "https://unit-tests-other.example.com",
          ) {
            switch (url) {
              case "{schema}://unit-tests-default.{tenant}.example.com":
                return {
                  with(
                    schema: "https" | "http" = "https",
                    tenant = "example",
                  ): Server<"UnitTest"> {
                    return "{schema}://unit-tests-default.{tenant}.example.com"
                      .replace("{schema}", schema)
                      .replace("{tenant}", tenant) as Server<"UnitTest">
                  },
                }

              case "https://unit-tests-other.example.com":
                return "https://unit-tests-other.example.com" as Server<"UnitTest">
            }
          }

          static custom(url: string): Server<"UnitTestCustom"> {
            return url as Server<"UnitTestCustom">
          }
        }
        "
      `)
    })

    it("hasServers is true", () => {
      expect(result.hasServers).toBe(true)
    })

    it("hasOperationServers is false", () => {
      expect(result.hasOperationServers).toBe(false)
    })
  })

  describe("root servers, operation servers", () => {
    let result: TestResult

    beforeAll(async () => {
      result = await runTest(
        [
          {
            url: "https://unit-tests-default.example.com",
            variables: {},
            description: "Default Unit test server",
          },
          {
            url: "https://unit-tests-other.example.com",
            variables: {},
            description: "Secondary Unit test server",
          },
        ],
        [
          {
            operationId: "testOperation",
            servers: [
              {
                url: "{schema}}://test-operation.{tenant}.example.com",
                variables: {
                  schema: {
                    default: "https",
                    enum: ["https", "http"],
                    description: "The protocol to use",
                  },
                  tenant: {
                    default: "example",
                    enum: [],
                    description: "Your tenant slug",
                  },
                },
                description: "Test operation server",
              },
            ],
          },
          {
            operationId: "anotherTestOperation",
            servers: [
              {
                url: "https://another-test-operation.example.com",
                variables: {},
                description: "Another test operation server",
              },
            ],
          },
        ],
      )
    })

    it("produces a default, specific, custom, and operations", () => {
      expect(result.output).toMatchInlineSnapshot(`
        "export class UnitTestServers {
          static default(): Server<"UnitTest"> {
            return "https://unit-tests-default.example.com" as Server<"UnitTest">
          }

          static specific(
            url:
              | "https://unit-tests-default.example.com"
              | "https://unit-tests-other.example.com",
          ) {
            switch (url) {
              case "https://unit-tests-default.example.com":
                return "https://unit-tests-default.example.com" as Server<"UnitTest">

              case "https://unit-tests-other.example.com":
                return "https://unit-tests-other.example.com" as Server<"UnitTest">
            }
          }

          static custom(url: string): Server<"UnitTestCustom"> {
            return url as Server<"UnitTestCustom">
          }

          static testOperation(url: "{schema}}://test-operation.{tenant}.example.com") {
            switch (url) {
              case "{schema}}://test-operation.{tenant}.example.com":
                return {
                  with(
                    schema: "https" | "http" = "https",
                    tenant = "example",
                  ): Server<"testOperation"> {
                    return "{schema}}://test-operation.{tenant}.example.com"
                      .replace("{schema}", schema)
                      .replace("{tenant}", tenant) as Server<"testOperation">
                  },
                }
            }
          }
          static anotherTestOperation(
            url: "https://another-test-operation.example.com",
          ) {
            switch (url) {
              case "https://another-test-operation.example.com":
                return "https://another-test-operation.example.com" as Server<"anotherTestOperation">
            }
          }
        }
        "
      `)
    })

    it("hasServers is true", () => {
      expect(result.hasServers).toBe(true)
    })

    it("hasOperationServers is true", () => {
      expect(result.hasOperationServers).toBe(true)
    })
  })
})
