import {describe, expect, it} from "@jest/globals"
import {
  extractArrayNotationKeys,
  parseCsvPairsToObject,
  parseQueryParameter,
  parseQueryParameters,
  type Style,
} from "./query-parser"

// todo: nodejs v20 doesn't support Iterator.from - replace when v20 support dropped.
function* toIterator<T>(arr: T[]): IterableIterator<T> {
  yield* arr
}

describe("query-parser", () => {
  describe("#parseCsvPairsToObject", () => {
    it("parses a single pair", () => {
      const expected = {foo: "bar"}
      const actual = parseCsvPairsToObject("foo,bar", ",")
      expect(actual).toEqual(expected)
    })
    it("parses multiple pairs", () => {
      const expected = {foo: "bar", baz: "qux"}
      const actual = parseCsvPairsToObject("foo|bar|baz|qux", "|")
      expect(actual).toEqual(expected)
    })
    // TODO: keys/values that include the separator?
  })

  describe("#extractArrayNotationKeys", () => {
    it("extracts basic keys", () => {
      const expected = ["foo[0]", "foo[1]", "foo[2]"]
      const actual = extractArrayNotationKeys(
        "foo",
        // biome-ignore lint/suspicious/noExplicitAny: node v20
        toIterator(["foo[0]", "foo[2]", "foo[1]"]) as any,
      )

      expect(actual).toEqual(expected)
    })

    it("extracts keys that include brackets", () => {
      const expected = ["foo[bar][0]", "foo[bar][1]", "foo[bar][2]"]
      const actual = extractArrayNotationKeys(
        "foo[bar]",
        // biome-ignore lint/suspicious/noExplicitAny: node v20
        toIterator(["foo[bar][0]", "foo[bar][2]", "foo[bar][1]"]) as any,
      )

      expect(actual).toEqual(expected)
    })

    it("doesn't extract keys using object notation with the same key", () => {
      const expected: string[] = []
      const actual = extractArrayNotationKeys(
        "foo",
        // biome-ignore lint/suspicious/noExplicitAny: node v20
        toIterator(["foo[bar]", "foo[baz]"]) as any,
      )

      expect(actual).toEqual(expected)
    })
  })

  describe("#parseQueryParameter", () => {
    describe("primitive types", () => {
      it("parses string parameters", () => {
        const query = new URLSearchParams("foo=bar")
        const actual = parseQueryParameter(
          {name: "foo", schema: {type: "string"}},
          query,
        )
        expect(actual).toEqual("bar")
      })
      it("parses number parameters", () => {
        const query = new URLSearchParams("foo=123")
        const actual = parseQueryParameter(
          {name: "foo", schema: {type: "number"}},
          query,
        )
        expect(actual).toEqual("123")
      })
      it("parses boolean parameters", () => {
        const query = new URLSearchParams("foo=true")
        const actual = parseQueryParameter(
          {name: "foo", schema: {type: "boolean"}},
          query,
        )
        expect(actual).toEqual("true")
      })
    })

    describe("simple object types", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {type: "string"},
          bar: {type: "number"},
          baz: {type: "boolean"},
        },
      } as const

      it("explode: true, style: deepObject", () => {
        const query = new URLSearchParams(
          "unrelated=bla&foobar[foo]=something&foobar[bar]=123&foobar[baz]=true",
        )

        const actual = parseQueryParameter(
          {name: "foobar", schema, explode: true, style: "deepObject"},
          query,
        )
        expect(actual).toEqual({foo: "something", bar: "123", baz: "true"})
      })

      it.each(["form", "pipeDelimited", "spaceDelimited"] satisfies Style[])(
        "explode: true, style: %s",
        (style) => {
          const query = new URLSearchParams(
            "unrelated=bla&foo=something&bar=123&baz=true",
          )

          const actual = parseQueryParameter(
            {name: "foobar", schema, explode: true, style},
            query,
          )
          expect(actual).toEqual({foo: "something", bar: "123", baz: "true"})
        },
      )

      it("explode: false, style: deepObject", () => {
        const query = new URLSearchParams("unrelated=bla")
        query.set(
          "foobar",
          JSON.stringify({foo: "something", bar: "123", baz: "true"}),
        )

        const actual = parseQueryParameter(
          {name: "foobar", schema, explode: false, style: "deepObject"},
          query,
        )
        expect(actual).toEqual({foo: "something", bar: "123", baz: "true"})
      })

      it.each([
        ["form", ","],
        ["pipeDelimited", "|"],
        ["spaceDelimited", " "],
      ] satisfies [Style, string][])(
        "explode: false, style: %s",
        (style, sep) => {
          const query = new URLSearchParams(
            `unrelated=bla&foobar=foo${sep}something${sep}bar${sep}123${sep}baz${sep}true`,
          )

          const actual = parseQueryParameter(
            {name: "foobar", schema, explode: false, style},
            query,
          )
          expect(actual).toEqual({foo: "something", bar: "123", baz: "true"})
        },
      )
    })

    describe("primitive array types", () => {
      const schema = {type: "array", items: {type: "string"}} as const

      it.each(["form", "pipeDelimited", "spaceDelimited"] satisfies Style[])(
        "explode: true, style: %s",
        (style) => {
          const query = new URLSearchParams("unrelated=bla&foo=bar&foo=baz")

          const actual = parseQueryParameter(
            {name: "foo", schema, explode: true, style},
            query,
          )
          expect(actual).toEqual(["bar", "baz"])
        },
      )

      it.each([
        ["form", ","],
        ["pipeDelimited", "|"],
        ["spaceDelimited", " "],
      ] satisfies [Style, string][])(
        "explode: false, style: %s",
        (style, sep) => {
          const query = new URLSearchParams(`unrelated=bla&foo=bar${sep}baz`)

          const actual = parseQueryParameter(
            {name: "foo", schema, explode: false, style},
            query,
          )
          expect(actual).toEqual(["bar", "baz"])
        },
      )

      it("explode: true, style: deepObject", () => {
        const query = new URLSearchParams("unrelated=bla")
        query.append("foo[123][0]", "bar")
        query.append("foo[123][1]", "baz")

        const actual = parseQueryParameter(
          {name: "foo[123]", schema, explode: true, style: "deepObject"},
          query,
        )
        expect(actual).toEqual(["bar", "baz"])
      })

      it("explode: false, style: deepObject", () => {
        const query = new URLSearchParams("unrelated=bla")
        query.set("foo", ["bar", "baz"].join(","))

        const actual = parseQueryParameter(
          {name: "foo", schema, explode: false, style: "deepObject"},
          query,
        )
        expect(actual).toEqual(["bar", "baz"])
      })
    })
  })

  describe("stripe /v1 api conventions; style: 'deepObject' explode: true", () => {
    /**
     * conventions based on the way the stripe nodejs sdk is implemented at time of writing,
     * https://github.com/stripe/stripe-node/blob/67b2f17c813bef59635baa6d8b3f246a8c355431/src/utils.ts#L53-L69
     * excluding their use of raw `[` / `]` characters rather than percent-encoded brackets.
     */

    it("serializes a nested object correctly", () => {
      const query =
        "components%5Baccount%5D%5Benabled%5D=true&components%5Baccount%5D%5Bfeatures%5D%5Bsome_flag%5D=false&components%5Baccount%5D%5Bfeatures%5D%5Bsome_other_flag%5D=true"

      const actual = parseQueryParameters(query, [
        {
          name: "components",
          style: "deepObject",
          explode: true,
          schema: {
            type: "object",
            properties: {
              account: {
                type: "object",
                properties: {
                  enabled: {type: "boolean"},
                  features: {
                    type: "object",
                    properties: {
                      some_flag: {type: "boolean"},
                      some_other_flag: {type: "boolean"},
                      some_other_other_flag: {type: "boolean"},
                    },
                  },
                },
              },
            },
          },
        },
      ])

      const expected = {
        components: {
          account: {
            enabled: "true",
            features: {
              some_flag: "false",
              some_other_flag: "true",
              some_other_other_flag: undefined,
            },
          },
        },
      }

      expect(actual).toEqual(expected)
    })
  })
})
