import {describe, expect} from "@jest/globals"
import {AbstractFetchClient, QueryParams} from "./main"

class ConcreteFetchClient extends AbstractFetchClient {
  constructor() {
    super({basePath: "", defaultHeaders: {}})
  }

  query(params: QueryParams) {
    return this._query(params)
  }
}

describe("main", () => {
  const client = new ConcreteFetchClient()

  describe("_query", () => {
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
})
