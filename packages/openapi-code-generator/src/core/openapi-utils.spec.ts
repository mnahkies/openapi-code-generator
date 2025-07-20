import {describe, expect, it} from "@jest/globals"
import {getNameFromRef, isRef} from "./openapi-utils"

describe("core/openapi-utils", () => {
  describe("#isRef", () => {
    it("returns true if $ref is defined", () => {
      expect(isRef({$ref: "#/something"})).toBe(true)
    })

    it("returns false if $ref is not defined", () => {
      expect(isRef({type: "number"})).toBe(false)
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
  })
})
