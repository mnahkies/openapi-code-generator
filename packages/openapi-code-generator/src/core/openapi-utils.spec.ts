import {describe, expect, it} from "@jest/globals"
import {extractPlaceholders, getNameFromRef, isRef} from "./openapi-utils"

describe("core/openapi-utils", () => {
  describe("#isRef", () => {
    it("returns true if $ref is defined", () => {
      expect(isRef({$ref: "#/something"})).toBe(true)
    })

    it("returns false if $ref is not defined", () => {
      expect(isRef({type: "number"})).toBe(false)
    })

    it("returns false if not passed an object", () => {
      expect(isRef(null)).toBe(false)
      expect(isRef(123)).toBe(false)
    })
  })

  describe("#getNameFromRef", () => {
    it("includes the given prefix", () => {
      expect(getNameFromRef({$ref: "#/components/schemas/Foo"}, "t_")).toBe(
        "t_Foo",
      )
    })

    it("replaces - with _", () => {
      expect(getNameFromRef({$ref: "#/components/schemas/Foo-Bar"}, "t_")).toBe(
        "t_Foo_Bar",
      )
    })

    it("replaces . with _", () => {
      expect(getNameFromRef({$ref: "#/components/schemas/Foo.Bar"}, "t_")).toBe(
        "t_Foo_Bar",
      )
    })

    it("throws on an invalid $ref", () => {
      expect(() => getNameFromRef({$ref: "#/"}, "t_")).toThrow(
        "no name found in $ref: '#/'",
      )
    })
  })

  describe("#extractPlaceholders", () => {
    it("returns an empty array if no placeholders in input", () => {
      expect(extractPlaceholders("/foo/bar")).toStrictEqual([])
    })

    it("extracts valid placeholders", () => {
      expect(extractPlaceholders("/{foo/{id}/bar}/{type}")).toStrictEqual([
        {
          placeholder: "id",
          wholeString: "{id}",
        },
        {placeholder: "type", wholeString: "{type}"},
      ])
    })

    // todo: expand tests for special characters / escaping
  })
})
