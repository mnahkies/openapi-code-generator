import {describe, expect, it} from "vitest"
import {
  boolParser,
  optionalBoolParser,
  remoteSpecRequestHeadersParser,
} from "./cli-utils.ts"

describe("core/cli-utils", () => {
  describe("optionalBoolParser", () => {
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
      ["", false],
    ])("%s -> %s", (input, expected) => {
      expect(optionalBoolParser(input)).toBe(expected)
    })

    it("throws for invalid input", () => {
      expect(() => optionalBoolParser("invalid")).toThrow(
        "'invalid' is not a valid boolean parameter",
      )
    })
  })

  describe("boolParser", () => {
    it.each([
      ["true", true],
      ["false", false],
    ])("%s -> %s", (input, expected) => {
      expect(boolParser(input)).toBe(expected)
    })

    it("throws for invalid input", () => {
      expect(() => boolParser("invalid")).toThrow(
        "'invalid' is not a valid boolean parameter",
      )
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

    it("throws on invalid JSON", () => {
      expect(() => remoteSpecRequestHeadersParser("not-json")).toThrow()
    })

    it("throws on invalid structure", () => {
      expect(() =>
        remoteSpecRequestHeadersParser(JSON.stringify({foo: "bar"})),
      ).toThrow()
    })
  })
})
