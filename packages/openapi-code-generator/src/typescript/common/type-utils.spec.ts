import {describe} from "@jest/globals"
import {intersect, union} from "./type-utils"

describe("typescript/common/type-utils", () => {

  describe("union", () => {

    it("handles an empty array", () => {
      expect(union([])).toBe("")
    })

    it("omits brackets for a single item", () => {
      expect(union(["1"])).toBe("1")
    })

    it("de-duplicates maintaining order of types", () => {
      expect(union(["1", "3", "2", "3"])).toBe("(1 | 3 | 2)")
      expect(union(["3", "3"])).toBe("3")
    })

    it("skips empty strings and falsy values", () => {
      expect(union(["1", "", "2", undefined, "3", null])).toBe("(1 | 2 | 3)")
    })

    it("accepts an array", () => {
      expect(union(["1", "2", "3"])).toBe("(1 | 2 | 3)")
    })

    it("accepts rest parameters", () => {
      expect(union("1", "2", "3")).toBe("(1 | 2 | 3)")
    })

  })

  describe("intersect", () => {

    it("handles an empty array", () => {
      expect(intersect([])).toBe("")
    })

    it("omits brackets for a single item", () => {
      expect(intersect(["1"])).toBe("1")
    })

    it("de-duplicates maintaining order of types", () => {
      expect(intersect(["1", "3", "2", "3"])).toBe("(1 & 3 & 2)")
      expect(intersect(["3", "3"])).toBe("3")
    })

    it("skips empty strings and falsy values", () => {
      expect(intersect(["1", "", "2", undefined, "3", null])).toBe("(1 & 2 & 3)")
    })

    it("accepts an array", () => {
      expect(intersect(["1", "2", "3"])).toBe("(1 & 2 & 3)")
    })

    it("accepts rest parameters", () => {
      expect(intersect("1", "2", "3")).toBe("(1 & 2 & 3)")
    })

  })

})
