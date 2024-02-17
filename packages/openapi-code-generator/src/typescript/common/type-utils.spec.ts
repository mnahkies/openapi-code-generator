import {describe, expect} from "@jest/globals"
import {intersect, object, objectProperty, union} from "./type-utils"

describe("typescript/common/type-utils", () => {
  describe("union", () => {
    it("handles an empty array", () => {
      expect(union([])).toBe("")
    })

    it("omits brackets for a single item", () => {
      expect(union(["1"])).toBe("1")
    })

    it("de-duplicates maintaining order of types", () => {
      expect(union(["1", "3", "2", "3"])).toBe("(1\n | 3\n | 2)")
      expect(union(["3", "3"])).toBe("3")
    })

    it("skips empty strings and falsy values", () => {
      const actual = union(["1", "", "2", undefined, "3", null])

      expect(actual).toBe("(1\n | 2\n | 3)")
    })

    it("accepts an array", () => {
      expect(union(["1", "2", "3"])).toBe("(1\n | 2\n | 3)")
    })

    it("accepts rest parameters", () => {
      expect(union("1", "2", "3")).toBe("(1\n | 2\n | 3)")
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
      const actual = intersect(["1", "", "2", undefined, "3", null])

      expect(actual).toBe("(1 & 2 & 3)")
    })

    it("accepts an array", () => {
      expect(intersect(["1", "2", "3"])).toBe("(1 & 2 & 3)")
    })

    it("accepts rest parameters", () => {
      expect(intersect("1", "2", "3")).toBe("(1 & 2 & 3)")
    })
  })

  describe("objectProperty", () => {
    it("returns a mutable required property", () => {
      const actual = objectProperty({
        name: "foo",
        type: "number",
        isRequired: true,
        isReadonly: false,
      })

      expect(actual).toBe('"foo": number')
    })

    it("returns a mutable optional property", () => {
      const actual = objectProperty({
        name: "foo",
        type: "number",
        isRequired: false,
        isReadonly: false,
      })

      expect(actual).toBe('"foo"?: number')
    })

    it("returns a readonly required property", () => {
      const actual = objectProperty({
        name: "foo",
        type: "number",
        isRequired: true,
        isReadonly: true,
      })

      expect(actual).toBe('readonly "foo": number')
    })

    it("returns a readonly optional property", () => {
      const actual = objectProperty({
        name: "foo",
        type: "number",
        isRequired: false,
        isReadonly: true,
      })

      expect(actual).toBe('readonly "foo"?: number')
    })
  })

  describe("object", () => {
    it("returns an empty string when no defined properties", () => {
      expect(object([""])).toBe("")
    })

    it("returns an object when there are defined properties", () => {
      const property = objectProperty({
        name: "foo",
        type: "string",
        isReadonly: false,
        isRequired: true,
      })

      const actual = object(property, "")

      expect(actual).toBe('{\n"foo": string\n}')
    })
  })
})
