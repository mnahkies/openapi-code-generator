import type {Server} from "node:http"
import {beforeAll, describe, expect, it} from "@jest/globals"
import type {AxiosError} from "axios"
import {ApiClient} from "./generated/client/axios/client"
import {E2ETestClientServers} from "./generated/client/fetch/client"
import {startServerFunctions} from "./index"
import {numberBetween} from "./test-utils"

describe.each(startServerFunctions)(
  "e2e - typescript-axios client against $name server",
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
        expect(headers).toMatchObject({
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
        expect(headers).toMatchObject({
          "access-control-allow-origin": "http://example.com",
          "access-control-allow-credentials": "true",
          "access-control-allow-methods": "GET,OPTIONS",
          "access-control-allow-headers": "Authorization,Content-Type",
        })
      })
    })

    describe("404 handling", () => {
      it("should handle 404s", async () => {
        const err = await client
          .getResponsesEmpty(undefined, {url: "/not-found"})
          .then(
            () => {
              throw new Error("expected request to fail")
            },
            (err: AxiosError) => err,
          )

        expect(err).toMatchObject({
          message: "Request failed with status code 404",
          name: "AxiosError",
          status: 404,
        })
        expect(err.response?.data).toMatchObject({
          code: 404,
          message: "route not found",
        })
      })
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
            (err: AxiosError) => err,
          )

        expect(err.message).toMatch("Request failed with status code 400")
        expect(err.status).toBe(400)
        expect(err.response?.data).toMatchObject({
          message: "Request validation failed parsing request header",
          phase: "request_validation",
          cause: expect.stringContaining("Expected number, received nan"),
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

      it("returns 400 when parameters fail validation", async () => {
        const err = await client
          .getValidationNumbersRandomNumber({
            // @ts-expect-error: testing runtime validation
            min: "one",
            // @ts-expect-error: testing runtime validation
            max: "ten",
          })
          .then(
            () => {
              throw new Error("expected request to fail")
            },
            (err: AxiosError) => err,
          )

        expect(err.message).toMatch("Request failed with status code 400")
        expect(err.status).toBe(400)
        expect(err.response?.data).toMatchObject({
          message: "Request validation failed parsing querystring",
          phase: "request_validation",
          cause: expect.stringContaining("Expected number, received nan"),
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

    describe("POST /validation/enumeration", () => {
      it("should error if the server receives an unknown enum value", async () => {
        const res = client.postValidationEnums({
          requestBody: {
            // @ts-expect-error: purple isn't a valid enum value
            colors: "purple",
            starRatings: 1,
          },
        })

        await expect(res).rejects.toThrow("Request failed with status code 400")
      })
      // TODO: figure out how to make a skew between client/server to test client receiving extraneous values
    })

    describe("GET /responses/empty", () => {
      it("returns undefined", async () => {
        const {status, data} = await client.getResponsesEmpty()

        expect(status).toBe(204)
        expect(data).toEqual("")
      })
    })

    describe("GET /responses/500", () => {
      it("returns response from error middleware", async () => {
        const err = await client.getResponses500().then(
          () => {
            throw new Error("expected request to fail")
          },
          (err: AxiosError) => err,
        )

        expect(err.message).toMatch("Request failed with status code 500")
        expect(err.status).toBe(500)
        expect(err.response?.data).toMatchObject({
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
        expect(res.data).toBe("Plain text response")
      })
    })
  },
)
