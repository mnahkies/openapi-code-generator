import {describe, expect, it} from "@jest/globals"
import {boolParser, remoteSpecRequestHeadersParser} from "./cli"

describe("cli", () => {
  describe("boolParser", () => {
    it.each([
      ["true", true],
      ["1", true],
      ["on", true],
      ["TRUE", true],
      ["1", true],
      ["ON", true],
      ["false", false],
      ["0", false],
      ["off", false],
      ["FALSE", false],
      ["0", false],
      ["OFF", false],
    ])("%s -> %s", (input, expected) => {
      expect(boolParser(input)).toBe(expected)
    })
  })

  describe("remoteSpecRequestHeadersParser", () => {
    it("accepts a single header", () => {
      expect(
        remoteSpecRequestHeadersParser(
          JSON.stringify({
            "https://example.com/": {
              name: "some-header-name",
              value: "some-header-value",
            },
          }),
        ),
      ).toEqual({
        "https://example.com/": [
          {name: "some-header-name", value: "some-header-value"},
        ],
      })
    })

    it("accepts multiple headers", () => {
      expect(
        remoteSpecRequestHeadersParser(
          JSON.stringify({
            "https://example.com/": [
              {
                name: "some-header-name",
                value: "some-header-value",
              },
              {
                name: "some-other-header-name",
                value: "some-other-header-value",
              },
            ],
          }),
        ),
      ).toEqual({
        "https://example.com/": [
          {name: "some-header-name", value: "some-header-value"},
          {name: "some-other-header-name", value: "some-other-header-value"},
        ],
      })
    })
  })
})
