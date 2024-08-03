import {describe} from "@jest/globals"
import {
  type GenericLoaderRequestHeaders,
  headersForRemoteUri,
} from "./generic.loader"

describe("core/loaders/generic.loader", () => {
  describe("headersForRemoteUri", () => {
    const possibleHeaders = {
      "127.0.0.1": [{name: "Authorization", value: "Bearer bare-ip-address"}],
      "https://example.com/specific-path.yaml": [
        {name: "Authorization", value: "Bearer specific-path"},
      ],
      "https://example.com:8080": [
        {name: "Proxy-Authorization", value: "Bearer domain-wide"},
      ],
      "https://example.com:8080/specifications": [
        {name: "Authorization", value: "Bearer sub-path"},
      ],
    } satisfies GenericLoaderRequestHeaders

    it("matches a loosely specified host", () => {
      const actual = headersForRemoteUri(
        "http://127.0.0.1:8080/openapi.yaml",
        possibleHeaders,
      )

      const expected: [string, string][] = [
        ["authorization", "Bearer bare-ip-address"],
      ]

      expect(Array.from(actual.entries())).toEqual(expected)
    })

    it("matches a strictly specified uri", () => {
      const actual = headersForRemoteUri(
        "https://example.com/specific-path.yaml",
        possibleHeaders,
      )

      const expected: [string, string][] = [
        ["authorization", "Bearer specific-path"],
      ]

      expect(Array.from(actual.entries())).toEqual(expected)
    })

    it("doesn't match other paths from a strictly specified uri", () => {
      const actual = headersForRemoteUri(
        "https://example.com/other-path.yaml",
        possibleHeaders,
      )

      const expected: [string, string][] = []

      expect(Array.from(actual.entries())).toEqual(expected)
    })

    it("stacks multiple matches", () => {
      const actual = headersForRemoteUri(
        "https://example.com:8080/specifications/some-spec.json",
        possibleHeaders,
      )

      const expected: [string, string][] = [
        ["authorization", "Bearer sub-path"],
        ["proxy-authorization", "Bearer domain-wide"],
      ]

      expect(Array.from(actual.entries())).toEqual(expected)
    })
  })
})
