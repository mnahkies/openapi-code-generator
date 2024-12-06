import {describe, expect, it} from "@jest/globals"
import type {IROperation, IRServer} from "../../core/openapi-types-normalized"
import {ClientServersBuilder} from "./client-servers-builder"
import {ImportBuilder} from "./import-builder"
import {TypescriptFormatterBiome} from "./typescript-formatter.biome"

type TestResult = {
  output: string
  hasServers: boolean
  hasOperationServers: boolean
  builder: ClientServersBuilder
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
    builder,
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

    it("produces a specific, and custom", () => {
      expect(result.output).toMatchInlineSnapshot(`
        "export class UnitTestServers {
          static default(): Server<"UnitTest"> {
            return UnitTestServers.server().build()
          }

          static server(url?: "{schema}://unit-tests-default.{tenant}.example.com"): {
            build: (schema?: "https" | "http", tenant?: string) => Server<"UnitTest">
          }
          static server(url?: "https://unit-tests-other.example.com"): {
            build: () => Server<"UnitTest">
          }
          static server(
            url: string = "{schema}://unit-tests-default.{tenant}.example.com",
          ): unknown {
            switch (url) {
              case "{schema}://unit-tests-default.{tenant}.example.com":
                return {
                  build(
                    schema: "https" | "http" = "https",
                    tenant = "example",
                  ): Server<"UnitTest"> {
                    return "{schema}://unit-tests-default.{tenant}.example.com"
                      .replace("{schema}", schema)
                      .replace("{tenant}", tenant) as Server<"UnitTest">
                  },
                }

              case "https://unit-tests-other.example.com":
                return {
                  build(): Server<"UnitTest"> {
                    return "https://unit-tests-other.example.com" as Server<"UnitTest">
                  },
                }

              default:
                throw new Error(\`no matching server for url '\${url}'\`)
            }
          }

          static custom(url: string): Server<"custom_UnitTest"> {
            return url as Server<"custom_UnitTest">
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

    it("produces a specific, custom, and operations", () => {
      expect(result.output).toMatchInlineSnapshot(`
        "export class UnitTestServersOperations {
          static testOperation(
            url?: "{schema}}://test-operation.{tenant}.example.com",
          ): {
            build: (
              schema?: "https" | "http",
              tenant?: string,
            ) => Server<"testOperation_UnitTest">
          }
          static testOperation(
            url: string = "{schema}}://test-operation.{tenant}.example.com",
          ): unknown {
            switch (url) {
              case "{schema}}://test-operation.{tenant}.example.com":
                return {
                  build(
                    schema: "https" | "http" = "https",
                    tenant = "example",
                  ): Server<"testOperation_UnitTest"> {
                    return "{schema}}://test-operation.{tenant}.example.com"
                      .replace("{schema}", schema)
                      .replace("{tenant}", tenant) as Server<"testOperation_UnitTest">
                  },
                }

              default:
                throw new Error(\`no matching server for url '\${url}'\`)
            }
          }

          static anotherTestOperation(
            url?: "https://another-test-operation.example.com",
          ): { build: () => Server<"anotherTestOperation_UnitTest"> }
          static anotherTestOperation(
            url: string = "https://another-test-operation.example.com",
          ): unknown {
            switch (url) {
              case "https://another-test-operation.example.com":
                return {
                  build(): Server<"anotherTestOperation_UnitTest"> {
                    return "https://another-test-operation.example.com" as Server<"anotherTestOperation_UnitTest">
                  },
                }

              default:
                throw new Error(\`no matching server for url '\${url}'\`)
            }
          }
        }

        export class UnitTestServers {
          static default(): Server<"UnitTest"> {
            return UnitTestServers.server().build()
          }

          static server(url?: "https://unit-tests-default.example.com"): {
            build: () => Server<"UnitTest">
          }
          static server(url?: "https://unit-tests-other.example.com"): {
            build: () => Server<"UnitTest">
          }
          static server(
            url: string = "https://unit-tests-default.example.com",
          ): unknown {
            switch (url) {
              case "https://unit-tests-default.example.com":
                return {
                  build(): Server<"UnitTest"> {
                    return "https://unit-tests-default.example.com" as Server<"UnitTest">
                  },
                }

              case "https://unit-tests-other.example.com":
                return {
                  build(): Server<"UnitTest"> {
                    return "https://unit-tests-other.example.com" as Server<"UnitTest">
                  },
                }

              default:
                throw new Error(\`no matching server for url '\${url}'\`)
            }
          }

          static readonly operations = UnitTestServersOperations

          static custom(url: string): Server<"custom_UnitTest"> {
            return url as Server<"custom_UnitTest">
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

    it("typeForOperationId returns the correct type when there are variables", () => {
      expect(
        result.builder.typeForOperationId("testOperation"),
      ).toMatchInlineSnapshot(`"Server<"testOperation_UnitTest">"`)
    })

    it("typeForOperationId returns the correct type when there are no variables", () => {
      expect(
        result.builder.typeForOperationId("anotherTestOperation"),
      ).toMatchInlineSnapshot(`"Server<"anotherTestOperation_UnitTest">"`)
    })

    it("defaultForOperationId returns the correct value when there are variables", () => {
      expect(
        result.builder.defaultForOperationId("testOperation"),
      ).toMatchInlineSnapshot(
        `"UnitTestServers.operations.testOperation().build()"`,
      )
    })

    it("defaultForOperationId returns the correct value when there are no variables", () => {
      expect(
        result.builder.defaultForOperationId("anotherTestOperation"),
      ).toMatchInlineSnapshot(
        `"UnitTestServers.operations.anotherTestOperation().build()"`,
      )
    })
  })
})
