import type {Server} from "node:http"
import {beforeAll, describe, expect} from "@jest/globals"
import {ApiClient} from "./generated/client/client"
import {main} from "./index"
import {numberBetween} from "./test-utils"

describe("e2e", () => {
  let server: Server
  let client: ApiClient

  beforeAll(async () => {
    const args = await main()
    client = new ApiClient({
      basePath: `http://localhost:${args.address.port}`,
      defaultHeaders: {},
    })
    server = args.server
  })

  afterAll(async () => {
    server.close()
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
})
