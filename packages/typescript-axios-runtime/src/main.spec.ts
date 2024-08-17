import {describe, expect, it} from "@jest/globals"
import type {AxiosRequestConfig, RawAxiosRequestHeaders} from "axios"
import {
  AbstractAxiosClient,
  type AbstractAxiosConfig,
  type HeaderParams,
  type QueryParams,
} from "./main"

class ConcreteAxiosClient extends AbstractAxiosClient {
  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor(config: AbstractAxiosConfig) {
    super(config)
  }

  query(params: QueryParams) {
    return this._query(params)
  }

  headers(
    paramHeaders: HeaderParams = {},
    optsHeaders: AxiosRequestConfig["headers"] = {},
  ): RawAxiosRequestHeaders {
    return this._headers(paramHeaders, optsHeaders)
  }
}

describe("typescript-axios-runtime/main", () => {
  describe("_query", () => {
    const client = new ConcreteAxiosClient({basePath: "", defaultHeaders: {}})

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

    it("handles objects", () => {
      expect(client.query({foo: {bar: "baz"}})).toBe(
        `?${encodeURIComponent("foo[bar]")}=baz`,
      )
    })

    it("handles arrays of objects with multiple properties", () => {
      expect(
        client.query({
          foo: [
            {prop1: "one", prop2: "two"},
            {prop1: "foo", prop2: "bar"},
          ],
          limit: 10,
          undefined: undefined,
          includeSomething: false,
        }),
      ).toBe(
        `?${encodeURIComponent("foo[prop1]")}=one&${encodeURIComponent(
          "foo[prop2]",
        )}=two&${encodeURIComponent("foo[prop1]")}=foo&${encodeURIComponent(
          "foo[prop2]",
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
      configHeaders?: AxiosRequestConfig["headers"]
    }) {
      const client = new ConcreteAxiosClient({
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

        expect(actual).toMatchObject({
          authorization: "Bearer: default",
        })
      })

      it("can override default headers with route headers", () => {
        const actual = getActual({
          defaultHeaders: {Authorization: "Bearer: default"},
          routeHeaders: {Authorization: "Bearer: route"},
        })

        expect(actual).toMatchObject({authorization: "Bearer: route"})
      })

      it("can override default headers with config headers", () => {
        const actual = getActual({
          defaultHeaders: {Authorization: "Bearer: default"},
          routeHeaders: {Authorization: "Bearer: route"},
          configHeaders: {Authorization: "Bearer: config"},
        })

        expect(actual).toMatchObject({authorization: "Bearer: config"})
      })

      it("can clear default headers with route headers", () => {
        const actual = getActual({
          defaultHeaders: {Authorization: "Bearer: default"},
          routeHeaders: {Authorization: null},
        })

        expect(actual.Authorization).toStrictEqual(undefined)
      })

      it("can clear default headers with config headers", () => {
        const actual = getActual({
          defaultHeaders: {Authorization: "Bearer: default"},
          routeHeaders: {Authorization: "Bearer: route"},
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          configHeaders: {Authorization: null as any},
        })

        expect(actual.Authorization).toStrictEqual(undefined)
      })
    })

    describe("route headers", () => {
      it("applies number route headers", () => {
        const actual = getActual({
          routeHeaders: {"X-Rate-Limit": 10},
        })

        expect(actual["x-rate-limit"]).toStrictEqual("10")
      })

      it("ignores undefined values and lets the default apply", () => {
        const actual = getActual({
          defaultHeaders: {"X-Rate-Limit": "10"},
          routeHeaders: {"X-Rate-Limit": undefined},
        })

        expect(actual["x-rate-limit"]).toStrictEqual("10")
      })

      it("applies tuple array headers", () => {
        const actual = getActual({
          defaultHeaders: {"X-Rate-Limit": "10"},
          routeHeaders: [
            ["X-Rate-Limit", 20],
            ["Foo", "bar"],
          ],
        })

        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        expect(actual["foo"]).toStrictEqual("bar")
        expect(actual["x-rate-limit"]).toStrictEqual("20")
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

        // Headers that aren't Set-Cookie get concatenated by the Headers built-in.
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        expect(actual["foo"]).toStrictEqual("bar, foobar")
        expect(actual["x-rate-limit"]).toStrictEqual("20")
      })
    })

    describe("config headers", () => {
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

        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        expect(actual["foo"]).toStrictEqual("bar")
        expect(actual["set-cookie"]).toStrictEqual(
          "one=cookie-1; SameSite=None; Secure,two=cookie-2; SameSite=None; Secure",
        )
        expect(actual["x-rate-limit"]).toStrictEqual("10")
      })
    })
  })
})
