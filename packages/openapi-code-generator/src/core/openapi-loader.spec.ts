import {describe, expect, it} from "@jest/globals"
import {normalizeRef, pathFromRef} from "./openapi-loader"

describe("core/openapi-loader", () => {
  describe("#normalizeRef", () => {
    it("rejects invalid $refs", () => {
      expect(() => normalizeRef("not a ref", "/some/path")).toThrow(
        /invalid \$ref '.+'/,
      )
    })

    describe("local paths", () => {
      it("normalizes an empty path to be an absolute path", () => {
        const $ref = "#/components/schemas/Test"
        const loadedFrom = "/absolute/root/path.yaml"
        expect(normalizeRef($ref, loadedFrom)).toBe(
          "/absolute/root/path.yaml#/components/schemas/Test",
        )
      })

      it("normalizes a relative path to be an absolute path", () => {
        const $ref = "./common.yaml#/components/schemas/Test"
        const loadedFrom = "/absolute/root/path.yaml"
        expect(normalizeRef($ref, loadedFrom)).toBe(
          "/absolute/root/common.yaml#/components/schemas/Test",
        )
      })

      it("normalizes an absolute path to remain an absolute path", () => {
        const $ref = "/different/root/file.yaml#/components/schemas/Test"
        const loadedFrom = "/absolute/root/path.yaml"
        expect(normalizeRef($ref, loadedFrom)).toBe(
          "/different/root/file.yaml#/components/schemas/Test",
        )
      })
    })

    describe("remote paths", () => {
      it("normalizes an empty path to be an absolute url", () => {
        const $ref = "#/components/schemas/Test"
        const loadedFrom = "https://example.com/docs/openapi.yaml"
        expect(normalizeRef($ref, loadedFrom)).toBe(
          "https://example.com/docs/openapi.yaml#/components/schemas/Test",
        )
      })

      it("normalizes a relative url to be an absolute url", () => {
        const $ref = "./common.yaml#/components/schemas/Test"
        const loadedFrom = "https://example.com/docs/openapi.yaml"
        expect(normalizeRef($ref, loadedFrom)).toBe(
          "https://example.com/docs/common.yaml#/components/schemas/Test",
        )
      })

      it("normalizes an relative url to remain an absolute url", () => {
        const $ref =
          "https://example.net/docs/common.yaml#/components/schemas/Test"
        const loadedFrom = "https://example.com/docs/openapi.yaml"
        expect(normalizeRef($ref, loadedFrom)).toBe(
          "https://example.net/docs/common.yaml#/components/schemas/Test",
        )
      })
    })
  })

  describe("#pathFromRef", () => {
    it("returns the relative path from a valid $ref", () => {
      const input = "./common.yaml#/components/schemas/Test"
      expect(pathFromRef(input)).toBe("./common.yaml")
    })

    it("returns the url path from a valid $ref", () => {
      const input = "https://example.com/common.yaml#/components/schemas/Test"
      expect(pathFromRef(input)).toBe("https://example.com/common.yaml")
    })

    it("throws an error on a empty path from a valid $ref", () => {
      const input = "#/components/schemas/Test"
      expect(() => pathFromRef(input)).toThrow(/invalid \$ref '.+'/)
    })
  })
})
