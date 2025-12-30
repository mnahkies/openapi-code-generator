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

    it("handles special characters in placeholder names", () => {
      // template-expression-param-name = 1*( %x00-7A / %x7C / %x7E-10FFFF )
      // essentially everything except { and }

      const specialNames = [
        "id:with-colon",
        "id@with-at",
        "id.with-dot",
        "id_with-underscore",
        "id~with-tilde",
        "id!with-bang",
        "id$with-dollar",
        "id&with-ampersand",
        "id'with-quote",
        "id(with-parens)",
        "id*with-asterisk",
        "id+with-plus",
        "id,with-comma",
        "id;with-semicolon",
        "id=with-equals",
        "id%20with-percent",
        "id中文", // Unicode
      ]

      for (const name of specialNames) {
        expect(extractPlaceholders(`/{${name}}`)).toStrictEqual([
          {
            placeholder: name,
            wholeString: `{${name}}`,
          },
        ])
      }
    })

    it("handles /, ?, and # in placeholder names as per ABNF", () => {
      // although these are forbidden in parameter values, the ABNF for the name allows them
      const names = ["name/with/slash", "name?with?question", "name#with#hash"]

      for (const name of names) {
        expect(extractPlaceholders(`/{${name}}`)).toStrictEqual([
          {
            placeholder: name,
            wholeString: `{${name}}`,
          },
        ])
      }
    })

    it("does not extract empty placeholders", () => {
      // template-expression-param-name = 1*...
      expect(extractPlaceholders("/{}")).toStrictEqual([])
    })

    it("handles multiple placeholders in a single path segment", () => {
      expect(extractPlaceholders("/{foo}{bar}")).toStrictEqual([
        {placeholder: "foo", wholeString: "{foo}"},
        {placeholder: "bar", wholeString: "{bar}"},
      ])
    })

    it("handles placeholders mixed with literals in a single path segment", () => {
      expect(extractPlaceholders("/prefix{foo}suffix")).toStrictEqual([
        {placeholder: "foo", wholeString: "{foo}"},
      ])
    })
  })
})
