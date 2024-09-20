import type {Server} from "node:http"
import {beforeAll, describe, expect, it} from "@jest/globals"
import {ApiClient} from "./generated/client/axios/client"
import {main} from "./index"
import {numberBetween} from "./test-utils"

describe("e2e - typescript-axios client", () => {
  let server: Server
  let client: ApiClient

  beforeAll(async () => {
    const args = await main()
    client = new ApiClient({
      basePath: `http://localhost:${args.address.port}`,
      defaultHeaders: {
        Authorization: "Bearer default-header",
      },
    })
    server = args.server
  })

  afterAll(async () => {
    server.close()
  })

  describe("GET /headers/undeclared", () => {
    it("provides the default headers", async () => {
      const {data} = await client.getHeadersUndeclared()

      expect(data).toEqual({
        typedHeaders: undefined,
        rawHeaders: expect.objectContaining({
          authorization: "Bearer default-header",
        }),
      })
    })
    it("provides default headers, and arbitrary extra headers", async () => {
      const {data} = await client.getHeadersUndeclared(undefined, {
        headers: {"some-random-header": "arbitrary-header"},
      })

      expect(data).toEqual({
        typedHeaders: undefined,
        rawHeaders: expect.objectContaining({
          authorization: "Bearer default-header",
          "some-random-header": "arbitrary-header",
        }),
      })
    })
  })

  describe("GET /headers/request", () => {
    it("provides the default headers", async () => {
      const {data} = await client.getHeadersRequest()

      expect(data).toEqual({
        typedHeaders: {
          authorization: "Bearer default-header",
        },
        rawHeaders: expect.objectContaining({
          authorization: "Bearer default-header",
        }),
      })
    })

    it("provides route level header with default headers", async () => {
      const {data} = await client.getHeadersRequest({
        routeLevelHeader: "route-header",
      })

      expect(data).toEqual({
        typedHeaders: {
          authorization: "Bearer default-header",
          "route-level-header": "route-header",
        },
        rawHeaders: expect.objectContaining({
          authorization: "Bearer default-header",
          "route-level-header": "route-header",
        }),
      })
    })

    it("overrides the default headers when a route level header is provided", async () => {
      const {data} = await client.getHeadersRequest({
        authorization: "Bearer override",
      })

      expect(data).toEqual({
        typedHeaders: {
          authorization: "Bearer override",
        },
        rawHeaders: expect.objectContaining({
          authorization: "Bearer override",
        }),
      })
    })

    it("overrides the default headers when a config level header is provided", async () => {
      const {data} = await client.getHeadersRequest(undefined, undefined, {
        headers: {authorization: "Bearer config"},
      })

      expect(data).toEqual({
        typedHeaders: {
          authorization: "Bearer config",
        },
        rawHeaders: expect.objectContaining({
          authorization: "Bearer config",
        }),
      })
    })

    it("provides route level header with default headers, and arbitrary extra headers", async () => {
      const {data} = await client.getHeadersRequest(
        {routeLevelHeader: "route-header"},
        undefined,
        {headers: {"some-random-header": "arbitrary-header"}},
      )

      expect(data).toEqual({
        typedHeaders: {
          authorization: "Bearer default-header",
          "route-level-header": "route-header",
        },
        rawHeaders: expect.objectContaining({
          authorization: "Bearer default-header",
          "route-level-header": "route-header",
          "some-random-header": "arbitrary-header",
        }),
      })
    })

    it("rejects headers of the wrong type", async () => {
      const err = await client
        .getHeadersRequest(
          // @ts-expect-error testing validation
          {numberHeader: "i'm not a number"},
        )
        .then(
          () => {
            throw new Error("expected request to fail")
          },
          (err) => err,
        )

      expect(err).toMatchObject({
        message: "Request failed with status code 400",
        name: "AxiosError",
        status: 400,
        response: expect.objectContaining({
          data: {
            cause: {
              message: "Request validation failed parsing request header",
            },
            message: "Request validation failed parsing request header",
          },
        }),
      })
    })
  })

  describe("GET /validation/numbers/random-number", () => {
    it("returns a random number", async () => {
      const {data} = await client.getValidationNumbersRandomNumber()

      expect(data).toEqual({
        result: numberBetween(0, 10),
        params: {
          min: 0,
          max: 10,
          forbidden: [],
        },
      })
    })

    it("handles a query param array of 1 element", async () => {
      const {data} = await client.getValidationNumbersRandomNumber({
        forbidden: [1],
      })

      expect(data.params).toMatchObject({
        forbidden: [1],
      })
    })

    it("handles a query param array of multiple elements", async () => {
      const {data} = await client.getValidationNumbersRandomNumber({
        forbidden: [1, 2, 3],
      })

      expect(data.params).toMatchObject({
        forbidden: [1, 2, 3],
      })
    })
  })
})
