import {beforeEach, describe, expect, it, jest} from "@jest/globals"
import {irFixture as ir} from "../../test/ir-model.fixtures.test-utils"
import type {OpenapiLoader} from "../openapi-loader"
import type {Parameter} from "../openapi-types"
import {defaultSyntheticNameGenerator} from "../synthetic-name-generator"
import {ParameterNormalizer} from "./parameter-normalizer"
import {SchemaNormalizer} from "./schema-normalizer"

describe("ParameterNormalizer", () => {
  let loader: jest.Mocked<OpenapiLoader>
  let schemaNormalizer: SchemaNormalizer
  let parameterNormalizer: ParameterNormalizer

  beforeEach(() => {
    loader = {
      parameter: jest.fn(),
      schema: jest.fn(),
      addVirtualType: jest.fn(),
    } as unknown as jest.Mocked<OpenapiLoader>

    schemaNormalizer = new SchemaNormalizer({
      extractInlineSchemas: true,
      enumExtensibility: "open",
    })

    parameterNormalizer = new ParameterNormalizer(
      loader,
      schemaNormalizer,
      defaultSyntheticNameGenerator,
    )
  })

  describe("normalizeParameter", () => {
    describe("path parameters", () => {
      it("handles simple style (default) and no explode", () => {
        const actual = parameterNormalizer.normalizeParameter({
          name: "id",
          in: "path",
          required: true,
          schema: {type: "string"},
        })

        expect(actual).toStrictEqual(
          ir.pathParameter({
            name: "id",
            in: "path",
            style: "simple",
            explode: false,
          }),
        )
      })

      it("handles label style and explode", () => {
        const actual = parameterNormalizer.normalizeParameter({
          name: "id",
          in: "path",
          required: true,
          style: "label",
          explode: true,
          schema: {type: "string"},
        })

        expect(actual).toStrictEqual(
          ir.pathParameter({
            name: "id",
            in: "path",
            style: "label",
            explode: true,
          }),
        )
      })

      it("handles matrix style and no explode", () => {
        const actual = parameterNormalizer.normalizeParameter({
          name: "id",
          in: "path",
          required: true,
          style: "matrix",
          explode: false,
          schema: {type: "string"},
        })

        expect(actual).toStrictEqual(
          ir.pathParameter({style: "matrix", explode: false}),
        )
      })

      it("throws on unsupported style", () => {
        const param = {
          name: "id",
          in: "path",
          style: "form",
          schema: {type: "string"},
        } as any
        expect(() => parameterNormalizer.normalizeParameter(param)).toThrow(
          "unsupported parameter style: 'form' for in: 'path'",
        )
      })
    })

    describe("query parameters", () => {
      it("handles form style (default) and explode (default true)", () => {
        const actual = parameterNormalizer.normalizeParameter({
          name: "filter",
          in: "query",
          schema: {type: "string"},
        })

        expect(actual).toStrictEqual(
          ir.queryParameter({name: "filter", style: "form", explode: true}),
        )
      })

      it("handles spaceDelimited style and explode", () => {
        const actual = parameterNormalizer.normalizeParameter({
          name: "tags",
          in: "query",
          style: "spaceDelimited",
          explode: true,
          schema: {type: "array", items: {type: "string"}},
        })

        expect(actual).toStrictEqual(
          ir.queryParameter({
            name: "tags",
            style: "spaceDelimited",
            schema: ir.array({items: ir.string()}),
          }),
        )
      })

      it("handles deepObject style and explode", () => {
        const actual = parameterNormalizer.normalizeParameter({
          name: "user",
          in: "query",
          style: "deepObject",
          explode: true,
          schema: {type: "object", properties: {name: {type: "string"}}},
        })

        expect(actual).toStrictEqual(
          ir.queryParameter({
            name: "user",
            style: "deepObject",
            schema: ir.object({properties: {name: ir.string()}}),
          }),
        )
      })

      it("handles pipeDelimited style and no explode", () => {
        const actual = parameterNormalizer.normalizeParameter({
          name: "tags",
          in: "query",
          style: "pipeDelimited",
          explode: false,
          schema: {type: "array", items: {type: "string"}},
        })

        expect(actual).toStrictEqual(
          ir.queryParameter({
            name: "tags",
            style: "pipeDelimited",
            explode: false,
            schema: ir.array({items: ir.string()}),
          }),
        )
      })
    })

    describe("header parameters", () => {
      it("handles simple style (default) and no explode (default false)", () => {
        const actual = parameterNormalizer.normalizeParameter({
          name: "X-Request-ID",
          in: "header",
          schema: {type: "string"},
        })
        expect(actual).toStrictEqual(
          ir.headerParameter({
            name: "X-Request-ID",
            style: "simple",
            explode: false,
          }),
        )
      })
    })

    describe("cookie parameters", () => {
      it("handles form style (default) and explode (default true)", () => {
        const actual = parameterNormalizer.normalizeParameter({
          name: "session",
          in: "cookie",
          schema: {type: "string"},
        })
        expect(actual).toStrictEqual(ir.cookieParameter())
      })
    })

    it("throws on unsupported location", () => {
      expect(() =>
        parameterNormalizer.normalizeParameter({
          name: "foo",
          in: "body",
          schema: {type: "string"},
        } as unknown as Parameter),
      ).toThrow("unsupported parameter location: 'body'")
    })
  })

  describe("normalizeParameters", () => {
    it("groups parameters and creates virtual types", () => {
      const pathParam: Parameter = {
        name: "id",
        in: "path",
        required: true,
        schema: {type: "string"},
      }
      const queryParam: Parameter = {
        name: "filter",
        in: "query",
        schema: {type: "string"},
      }
      const headerParam: Parameter = {
        name: "X-Header",
        in: "header",
        schema: {type: "string"},
      }

      loader.parameter.mockImplementation((it) => it as Parameter)
      loader.schema.mockImplementation((it) => it as any)
      loader.addVirtualType.mockImplementation((_opId, name) =>
        ir.ref(name, "virtual"),
      )

      const actual = parameterNormalizer.normalizeParameters("getThing", [
        pathParam,
        queryParam,
        headerParam,
      ])

      expect(actual).toStrictEqual(
        ir.operationParameters({
          all: [
            ir.pathParameter(),
            ir.queryParameter(),
            ir.headerParameter({name: "X-Header"}),
          ],
          path: {
            name: "getThingParamSchema",
            list: [ir.pathParameter()],
            $ref: ir.ref("GetThingParamSchema", "virtual"),
          },
          query: {
            name: "getThingQuerySchema",
            list: [ir.queryParameter()],
            $ref: ir.ref("GetThingQuerySchema", "virtual"),
          },
          header: {
            name: "getThingRequestHeaderSchema",
            list: [ir.headerParameter({name: "X-Header"})],
            $ref: ir.ref("GetThingRequestHeaderSchema", "virtual"),
          },
        }),
      )

      expect(loader.addVirtualType).toHaveBeenLastCalledWith(
        "getThing",
        "GetThingRequestHeaderSchema",
        expect.objectContaining({
          properties: {
            "x-header": expect.anything(),
          },
        }),
      )
    })

    it("handles empty parameters", () => {
      const actual = parameterNormalizer.normalizeParameters("getThing", [])

      expect(actual).toStrictEqual(
        ir.operationParameters({
          path: {name: "getThingParamSchema", list: [], $ref: undefined},
          query: {name: "getThingQuerySchema", list: [], $ref: undefined},
          header: {
            name: "getThingRequestHeaderSchema",
            list: [],
            $ref: undefined,
          },
        }),
      )
    })
  })

  describe("reduceParametersToOpenApiSchema", () => {
    it("handles required parameters in virtual types", () => {
      const queryParam: Parameter = {
        name: "filter",
        in: "query",
        required: true,
        schema: {type: "string"},
      }

      loader.parameter.mockReturnValue(queryParam)
      loader.schema.mockReturnValue({type: "string"} as any)
      loader.addVirtualType.mockImplementation((_operationId, name) =>
        ir.ref(name, "virtual"),
      )

      parameterNormalizer.normalizeParameters("getThing", [queryParam])

      expect(loader.addVirtualType).toHaveBeenCalledWith(
        "getThing",
        "GetThingQuerySchema",
        expect.objectContaining({
          required: ["filter"],
        }),
      )
    })

    it("coerces exploded array query parameters", () => {
      const queryParam: Parameter = {
        name: "tags",
        in: "query",
        schema: {type: "array", items: {type: "string"}},
        explode: true,
      }

      loader.parameter.mockReturnValue(queryParam)
      loader.schema.mockReturnValue({
        type: "array",
        items: {type: "string"},
      } as any)
      loader.addVirtualType.mockImplementation((_opId, name) =>
        ir.ref(name, "virtual"),
      )

      parameterNormalizer.normalizeParameters("getThing", [queryParam])

      expect(loader.addVirtualType).toHaveBeenCalledWith(
        "getThing",
        "GetThingQuerySchema",
        expect.objectContaining({
          properties: {
            tags: expect.objectContaining({
              "x-internal-preprocess": {
                deserialize: {
                  fn: "(it: unknown) => Array.isArray(it) || it === undefined ? it : [it]",
                },
              },
            }),
          },
        }),
      )
    })
  })
})
