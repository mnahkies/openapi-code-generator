// biome-ignore-all lint/suspicious/noExplicitAny: tests

import {describe, expect, it} from "@jest/globals"
import {
  AbstractFetchClient,
  type AbstractFetchClientConfig,
  type HeaderParams,
  type HeadersInit,
  type QueryParams,
} from "./main"
import type {Encoding} from "./request-bodies/url-search-params"

class ConcreteFetchClient extends AbstractFetchClient {
  // biome-ignore lint/complexity/noUselessConstructor: make public
  constructor(config: AbstractFetchClientConfig) {
    super(config)
  }

  query(
    params: QueryParams,
    encodings: Record<string, Encoding> | undefined = undefined,
  ): string {
    return this._query(params, encodings)
  }

  headers(
    paramHeaders: HeaderParams = {},
    optsHeaders: HeadersInit = {},
  ): Headers {
    return this._headers(paramHeaders, optsHeaders)
  }
}

describe("typescript-fetch-runtime/main", () => {
  describe("_query", () => {
    const client = new ConcreteFetchClient({
      basePath: "http://localhost:8080",
      defaultHeaders: {Authorization: "Bearer: default"},
    })

    it("returns an empty string when all params are undefined", () => {
      expect(client.query({foo: undefined, bar: undefined})).toBe("")
    })

    it("returns the defined params in a simple case", () => {
      expect(client.query({foo: undefined, bar: "baz", foobar: "value"})).toBe(
        "?bar=baz&foobar=value",
      )
    })

    it("repeats array params", () => {
      expect(client.query({foo: ["bar", "baz"]})).toBe("?foo=bar&foo=baz")
    })

    it("objects are unnested by default", () => {
      expect(client.query({foo: {bar: "baz"}})).toBe(`?bar=baz`)
    })

    it("handles exploded style deepObject", () => {
      expect(
        client.query(
          {foo: {bar: "baz"}},
          {foo: {explode: true, style: "deepObject"}},
        ),
      ).toBe(`?${encodeURIComponent("foo[bar]")}=baz`)
    })

    it("handles arrays of objects with multiple properties", () => {
      expect(
        client.query(
          {
            foo: [
              {prop1: "one", prop2: "two"},
              {prop1: "foo", prop2: "bar"},
            ],
            limit: 10,
            undefined: undefined,
            includeSomething: false,
          },
          {
            foo: {explode: true, style: "deepObject"},
          },
        ),
      ).toBe(
        `?${encodeURIComponent("foo[0][prop1]")}=one&${encodeURIComponent(
          "foo[0][prop2]",
        )}=two&${encodeURIComponent("foo[1][prop1]")}=foo&${encodeURIComponent(
          "foo[1][prop2]",
        )}=bar&limit=10&includeSomething=false`,
      )
    })
  })

  describe("_headers", () => {
    function getActual({
      defaultHeaders,
      routeHeaders,
      configHeaders,
    }: {
      defaultHeaders?: Record<string, string>
      routeHeaders?: HeaderParams
      configHeaders?: HeadersInit
    }) {
      const client = new ConcreteFetchClient({
        basePath: "",
        defaultHeaders: defaultHeaders ?? {},
      })
      return client.headers(routeHeaders, configHeaders)
    }

    describe("default headers", () => {
      it("can set default headers", () => {
        const actual = getActual({
          defaultHeaders: {Authorization: "Bearer: default"},
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          ["authorization", "Bearer: default"],
        ])
      })

      it("can override default headers with route headers", () => {
        const actual = getActual({
          defaultHeaders: {Authorization: "Bearer: default"},
          routeHeaders: {Authorization: "Bearer: route"},
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          ["authorization", "Bearer: route"],
        ])
      })

      it("can override default headers with config headers", () => {
        const actual = getActual({
          defaultHeaders: {Authorization: "Bearer: default"},
          configHeaders: {Authorization: "Bearer: config"},
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          ["authorization", "Bearer: config"],
        ])
      })

      it("can clear default headers with route headers", () => {
        const actual = getActual({
          defaultHeaders: {Authorization: "Bearer: default"},
          routeHeaders: {Authorization: null},
        })

        expect(Array.from(actual.entries())).toStrictEqual([])
      })

      it("can clear default headers with config headers", () => {
        const actual = getActual({
          defaultHeaders: {Authorization: "Bearer: default"},
          routeHeaders: {Authorization: "Bearer: route"},
          configHeaders: {Authorization: null as any},
        })

        expect(Array.from(actual.entries())).toStrictEqual([])
      })
    })

    describe("route headers", () => {
      it("applies number route headers", () => {
        const actual = getActual({
          routeHeaders: {"X-Rate-Limit": 10},
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          ["x-rate-limit", "10"],
        ])
      })

      it("ignores undefined values and lets the default apply", () => {
        const actual = getActual({
          defaultHeaders: {"X-Rate-Limit": "10"},
          routeHeaders: {"X-Rate-Limit": undefined},
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          ["x-rate-limit", "10"],
        ])
      })

      it("applies tuple array headers", () => {
        const actual = getActual({
          defaultHeaders: {"X-Rate-Limit": "10"},
          routeHeaders: [
            ["X-Rate-Limit", 20],
            ["Foo", "bar"],
          ],
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          ["foo", "bar"],
          ["x-rate-limit", "20"],
        ])
      })

      it("applies Headers", () => {
        const headers = new Headers()
        headers.append("X-Rate-Limit", "20")
        headers.append("Foo", "bar")
        headers.append("Foo", "foobar")

        const actual = getActual({
          defaultHeaders: {"X-Rate-Limit": "10"},
          routeHeaders: headers,
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          // Headers that aren't Set-Cookie get concatenated by the Headers built-in.
          ["foo", "bar, foobar"],
          ["x-rate-limit", "20"],
        ])
      })
    })

    describe("config headers", () => {
      it("can receive a Headers object correctly", () => {
        const headers = new Headers()
        headers.append("Set-Cookie", "one=cookie-1; SameSite=None; Secure")
        headers.append("Set-Cookie", "two=cookie-2; SameSite=None; Secure")

        const actual = getActual({
          defaultHeaders: {"X-Rate-Limit": "10"},
          routeHeaders: {"X-Rate-Limit": undefined},
          configHeaders: headers,
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          ["set-cookie", "one=cookie-1; SameSite=None; Secure"],
          ["set-cookie", "two=cookie-2; SameSite=None; Secure"],
          ["x-rate-limit", "10"],
        ])
      })

      it("can receive a [string, string][] correctly", () => {
        const headers = [
          ["Set-Cookie", "one=cookie-1; SameSite=None; Secure"] as const,
          ["Set-Cookie", "two=cookie-2; SameSite=None; Secure"] as const,
        ] as const

        const actual = getActual({
          defaultHeaders: {"X-Rate-Limit": "10"},
          routeHeaders: {"X-Rate-Limit": undefined},
          configHeaders: headers,
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          ["set-cookie", "one=cookie-1; SameSite=None; Secure"],
          ["set-cookie", "two=cookie-2; SameSite=None; Secure"],
          ["x-rate-limit", "10"],
        ])
      })

      it("can receive a string[][] correctly", () => {
        const headers = [
          [
            "Set-Cookie",
            "one=cookie-1; SameSite=None; Secure",
            "two=cookie-2; SameSite=None; Secure",
          ],
          ["Foo", "bar"],
        ]

        const actual = getActual({
          defaultHeaders: {"X-Rate-Limit": "10"},
          routeHeaders: {"X-Rate-Limit": undefined},
          configHeaders: headers,
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          ["foo", "bar"],
          ["set-cookie", "one=cookie-1; SameSite=None; Secure"],
          ["set-cookie", "two=cookie-2; SameSite=None; Secure"],
          ["x-rate-limit", "10"],
        ])
      })
      it("can receive a Record<string, string|string[]> correctly", () => {
        const headers = {
          "Set-Cookie": [
            "one=cookie-1; SameSite=None; Secure",
            "two=cookie-2; SameSite=None; Secure",
          ],
          Foo: "bar",
        }

        const actual = getActual({
          defaultHeaders: {"X-Rate-Limit": "10"},
          routeHeaders: {"X-Rate-Limit": undefined},
          configHeaders: headers,
        })

        expect(Array.from(actual.entries())).toStrictEqual([
          ["foo", "bar"],
          ["set-cookie", "one=cookie-1; SameSite=None; Secure"],
          ["set-cookie", "two=cookie-2; SameSite=None; Secure"],
          ["x-rate-limit", "10"],
        ])
      })
    })
  })
})
