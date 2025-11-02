import type {Server} from "node:http"
import {afterAll, beforeAll, describe, expect, it} from "@jest/globals"
import {
  ApiClient,
  E2ETestClientServers,
} from "./generated/client/fetch/client.ts"
import type {t_ProductOrder} from "./generated/client/fetch/models.ts"
import {startServerFunctions} from "./index.ts"
import {numberBetween} from "./test-utils.ts"

describe.each(startServerFunctions)(
  "e2e - typescript-fetch client against $name server",
  ({startServer}) => {
    let server: Server | undefined
    let client: ApiClient

    beforeAll(async () => {
      const args = await startServer()
      client = new ApiClient({
        basePath: E2ETestClientServers.server(
          "{protocol}://{host}:{port}",
        ).build(undefined, undefined, args.address.port.toString()),
        defaultHeaders: {
          Authorization: "Bearer default-header",
        },
      })
      server = args.server
    })

    afterAll(async () => {
      server?.close()
    })

    describe("CORS", () => {
      it("should send the correct CORS headers", async () => {
        const {headers} = await client.getResponsesEmpty(undefined, {
          headers: {
            Origin: "http://e2e.example.com",
          },
        })
        expect(Object.fromEntries(headers)).toMatchObject({
          "access-control-allow-origin": "http://example.com",
          "access-control-allow-credentials": "true",
        })
      })
      it("should support pre-flight requests", async () => {
        const {headers} = await client.getResponsesEmpty(undefined, {
          method: "OPTIONS",
          headers: {
            Origin: "http://e2e.example.com",
            "Access-Control-Request-Method": "POST",
          },
        })
        expect(Object.fromEntries(headers)).toMatchObject({
          "access-control-allow-origin": "http://example.com",
          "access-control-allow-credentials": "true",
          "access-control-allow-methods": "GET,OPTIONS",
          "access-control-allow-headers": "Authorization,Content-Type",
        })
      })
    })

    describe("404 handling", () => {
      it("should handle 404s", async () => {
        // @ts-expect-error: using protected method in test
        const res = await client._fetch(`${client.basePath}/not-found`, {
          method: "GET",
        })

        expect(res.status).toBe(404)
        await expect(res.json()).resolves.toMatchObject({
          code: 404,
          message: "route not found",
        })
      })
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

      it("parses headers correctly", async () => {
        const res = await client.getHeadersRequest({
          numberHeader: 12,
          booleanHeader: true,
          secondBooleanHeader: false,
          authorization: "Bearer test",
        })

        expect(res.status).toBe(200)

        await expect(res.json()).resolves.toEqual({
          rawHeaders: expect.objectContaining({
            authorization: "Bearer test",
            "number-header": "12",
            "boolean-header": "true",
            "second-boolean-header": "false",
          }),
          typedHeaders: {
            authorization: "Bearer test",
            "number-header": 12,
            "boolean-header": true,
            "second-boolean-header": false,
          },
        })
      })

      it("rejects headers of the wrong type (number)", async () => {
        const res = await client.getHeadersRequest(
          // @ts-expect-error testing validation
          {numberHeader: "i'm not a number"},
        )

        expect(res.status).toBe(400)

        await expect(res.json()).resolves.toMatchObject({
          message: "Request validation failed parsing request header",
          phase: "request_validation",
          cause: expect.stringMatching(
            /Expected number, received nan|Invalid input: expected number, received NaN/,
          ),
        })
      })

      it("rejects headers of the wrong type (boolean)", async () => {
        const res = await client.getHeadersRequest(
          // @ts-expect-error testing validation
          {booleanHeader: "i'm not a boolean"},
        )

        expect(res.status).toBe(400)

        await expect(res.json()).resolves.toMatchObject({
          message: "Request validation failed parsing request header",
          phase: "request_validation",
          cause: expect.stringMatching(
            /Expected boolean, received string|Invalid input: expected boolean, received string/,
          ),
        })
      })
    })

    describe("GET /validation/numbers/random-number", () => {
      it("returns a random number", async () => {
        const res = await client.getValidationNumbersRandomNumber()
        const body = await res.json()

        expect(body).toEqual({
          result: numberBetween(0, 10),
          params: {
            min: 0,
            max: 10,
            forbidden: [],
          },
        })
        expect(res.status).toBe(200)
      })

      it("returns 400 when parameters fail validation", async () => {
        const res = await client.getValidationNumbersRandomNumber({
          // @ts-expect-error: testing runtime validation
          min: "one",
          // @ts-expect-error: testing runtime validation
          max: "ten",
        })

        expect(res.status).toBe(400)
        await expect(res.json()).resolves.toMatchObject({
          message: "Request validation failed parsing querystring",
          phase: "request_validation",
          cause: expect.stringMatching(
            /Expected number, received nan|Invalid input: expected number, received NaN/,
          ),
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

    describe("POST /validation/enumeration", () => {
      it("should error if the server receives an unknown enum value", async () => {
        const res = await client.postValidationEnums({
          requestBody: {
            // @ts-expect-error: purple isn't a valid enum value
            colors: "purple",
            starRatings: 1,
          },
        })

        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body).toMatchObject({
          message: "Request validation failed parsing request body",
        })
      })
      // TODO: figure out how to make a skew between client/server to test client receiving extraneous values
    })

    describe("POST /validation/optional-body", () => {
      it("should send and accept the body if passed", async () => {
        const res = await client.postValidationOptionalBody({
          requestBody: {id: "123"},
        })

        expect(res.status).toBe(200)
        await expect(res.json()).resolves.toMatchObject({id: "123"})
      })
      it("should omit the body if not passed", async () => {
        const res = await client.postValidationOptionalBody()

        await expect(res.text()).resolves.toBe("")
        expect(res.status).toBe(204)
      })
    })

    describe("GET /responses/empty", () => {
      it("returns undefined", async () => {
        const res = await client.getResponsesEmpty()

        expect(res.status).toBe(204)
        await expect(res.json()).rejects.toThrow("Unexpected end of JSON input")
      })
    })

    describe("GET /responses/500", () => {
      it("returns response from error middleware", async () => {
        const res = await client.getResponses500()

        expect(res.status).toBe(500)
        await expect(res.json()).resolves.toMatchObject({
          message: "Request handler threw unhandled exception",
          phase: "request_handler",
          cause: expect.stringContaining("something went wrong"),
        })
      })
    })

    describe("GET /escape-hatches", () => {
      it("can do raw response handling", async () => {
        const res = await client.getEscapeHatchesPlainText()

        expect(res.status).toBe(200)
        await expect(res.text()).resolves.toBe("Plain text response")
      })
    })

    describe("POST /media-types/text", () => {
      it("can send and parse text/plain request bodies", async () => {
        const res = await client.postMediaTypesText({
          requestBody: "Some plain text",
        })

        expect(res.status).toBe(200)
        await expect(res.text()).resolves.toBe("Some plain text")
      })
    })

    describe("POST /media-types/x-www-form-urlencoded", () => {
      it("can send and parse application/x-www-form-urlencoded request bodies", async () => {
        const productOrder = {
          sku: "sku_123",
          quantity: 2,
          address: {
            address1: "Green Park",
            postcode: "SW1A 1AA",
          },
        } satisfies t_ProductOrder

        const res = await client.postMediaTypesXWwwFormUrlencoded({
          requestBody: productOrder,
        })
        expect(res.status).toBe(200)
        await expect(res.json()).resolves.toStrictEqual(productOrder)
      })
    })

    describe("query parameters", () => {
      it("GET /params/simple-query", async () => {
        const res = await client.getParamsSimpleQuery({
          orderBy: "asc",
          limit: 10,
        })

        expect(res.status).toBe(200)
        await expect(res.json()).resolves.toEqual({
          orderBy: "asc",
          limit: 10,
        })
      })

      it("GET /params/default-object-query", async () => {
        const res = await client.getParamsDefaultObjectQuery({
          filter: {name: "John", age: 30},
        })

        expect(res.status).toBe(200)
        await expect(res.json()).resolves.toEqual({
          filter: {name: "John", age: 30},
        })
      })

      it("GET /params/unexploded-object-query", async () => {
        const res = await client.getParamsUnexplodedObjectQuery({
          filter: {name: "John", age: 30},
        })

        expect(res.status).toBe(200)
        await expect(res.json()).resolves.toEqual({
          filter: {name: "John", age: 30},
        })
      })
    })
  },
)
