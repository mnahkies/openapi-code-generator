import type {Server} from "node:http"
import {beforeAll, describe, expect, it} from "@jest/globals"
import {ApiClient, E2ETestClientServers} from "./generated/client/fetch/client"
import {main} from "./index"
import {numberBetween} from "./test-utils"

describe("e2e - typescript-fetch client", () => {
  let server: Server
  let client: ApiClient

  beforeAll(async () => {
    const args = await main()
    client = new ApiClient({
      basePath: E2ETestClientServers.server("{protocol}://{host}:{port}").build(
        undefined,
        undefined,
        args.address.port.toString(),
      ),
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
      const res = await client.getHeadersUndeclared()

      expect(res.status).toBe(200)

      const body = await res.json()

      expect(body).toEqual({
        typedHeaders: undefined,
        rawHeaders: expect.objectContaining({
          authorization: "Bearer default-header",
        }),
      })
    })
    it("provides default headers, and arbitrary extra headers", async () => {
      const res = await client.getHeadersUndeclared(undefined, {
        headers: {"some-random-header": "arbitrary-header"},
      })

      expect(res.status).toBe(200)

      const body = await res.json()

      expect(body).toEqual({
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
      const res = await client.getHeadersRequest()

      expect(res.status).toBe(200)

      const body = await res.json()

      expect(body).toEqual({
        typedHeaders: {
          authorization: "Bearer default-header",
        },
        rawHeaders: expect.objectContaining({
          authorization: "Bearer default-header",
        }),
      })
    })

    it("provides route level header with default headers", async () => {
      const res = await client.getHeadersRequest({
        routeLevelHeader: "route-header",
      })

      expect(res.status).toBe(200)

      const body = await res.json()

      expect(body).toEqual({
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
      const res = await client.getHeadersRequest({
        authorization: "Bearer override",
      })

      expect(res.status).toBe(200)

      const body = await res.json()

      expect(body).toEqual({
        typedHeaders: {
          authorization: "Bearer override",
        },
        rawHeaders: expect.objectContaining({
          authorization: "Bearer override",
        }),
      })
    })

    it("overrides the default headers when a config level header is provided", async () => {
      const res = await client.getHeadersRequest(undefined, undefined, {
        headers: {authorization: "Bearer config"},
      })

      expect(res.status).toBe(200)

      const body = await res.json()

      expect(body).toEqual({
        typedHeaders: {
          authorization: "Bearer config",
        },
        rawHeaders: expect.objectContaining({
          authorization: "Bearer config",
        }),
      })
    })

    it("provides route level header with default headers, and arbitrary extra headers", async () => {
      const res = await client.getHeadersRequest(
        {routeLevelHeader: "route-header"},
        undefined,
        {headers: {"some-random-header": "arbitrary-header"}},
      )

      expect(res.status).toBe(200)

      const body = await res.json()

      expect(body).toEqual({
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
      const res = await client.getHeadersRequest(
        // @ts-expect-error testing validation
        {numberHeader: "i'm not a number"},
      )

      expect(res.status).toBe(400)

      const body = await res.json()

      expect(body).toEqual({
        cause: {
          message: "Request validation failed parsing request header",
        },
        message: "Request validation failed parsing request header",
      })
    })
  })

  describe("GET /validation/numbers/random-number", () => {
    it("returns a random number", async () => {
      const res = await client.getValidationNumbersRandomNumber()
      expect(res.status).toBe(200)

      const body = await res.json()

      expect(body).toEqual({
        result: numberBetween(0, 10),
        params: {
          min: 0,
          max: 10,
          forbidden: [],
        },
      })
    })

    it("handles a query param array of 1 element", async () => {
      const res = await client.getValidationNumbersRandomNumber({
        forbidden: [1],
      })
      expect(res.status).toBe(200)

      const body = await res.json()

      expect(body.params).toMatchObject({
        forbidden: [1],
      })
    })

    it("handles a query param array of multiple elements", async () => {
      const res = await client.getValidationNumbersRandomNumber({
        forbidden: [1, 2, 3],
      })
      expect(res.status).toBe(200)

      const body = await res.json()

      expect(body.params).toMatchObject({
        forbidden: [1, 2, 3],
      })
    })
  })

  describe("GET /responses/empty", () => {
    it("returns undefined", async () => {
      const res = await client.getResponsesEmpty()

      const body = await res.json()
      expect(body).toBeUndefined()
    })
  })
})
