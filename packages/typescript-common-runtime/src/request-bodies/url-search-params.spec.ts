import {describe, expect, it} from "@jest/globals"
import {requestBodyToUrlSearchParams} from "./url-search-params"

describe("typescript-fetch-runtime/request-bodies/requestBodyToUrlSearchParams", () => {
  it("encodes the basic example from the specification correctly", async () => {
    const actual = requestBodyToUrlSearchParams(
      {
        id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
        address: {
          streetAddress: "123 Example Dr.",
          city: "Somewhere",
          state: "CA",
          zip: "99999+1234",
        },
      },
      {address: {explode: false, style: "deepObject"}},
    )

    expect(actual.toString()).toStrictEqual(
      // todo: original example from oas differs, https://github.com/OAI/OpenAPI-Specification/issues/4813
      "id=f81d4fae-7dec-11d0-a765-00a0c91e6bf6&address=%7B%22streetAddress%22%3A%22123+Example+Dr.%22%2C%22city%22%3A%22Somewhere%22%2C%22state%22%3A%22CA%22%2C%22zip%22%3A%2299999%2B1234%22%7D",
    )
  })

  describe.each([
    {
      explode: true,
      style: "form",
      string: "color=blue",
      array: "color=blue&color=black&color=brown",
      object: "R=100&G=200&B=150",
    },
    {
      explode: false,
      style: "form",
      string: "color=blue",
      array: "color=blue%2Cblack%2Cbrown",
      // todo: original example from oas differs, https://github.com/OAI/OpenAPI-Specification/issues/4813
      // array: "color=blue,black,brown",
      object: "color=R%2C100%2CG%2C200%2CB%2C150",
      // todo: original example from oas differs, https://github.com/OAI/OpenAPI-Specification/issues/4813
      // object: "color=R,100,G,200,B,150",
    },
    {
      explode: true,
      style: "spaceDelimited",
      // note: undefined by spec
      string: "color=blue",
      // note: undefined by spec
      array: "color=blue&color=black&color=brown",
      // note: undefined by spec
      object: "R=100&G=200&B=150",
    },
    {
      explode: false,
      style: "spaceDelimited",
      // note: undefined by spec
      string: "color=blue",
      array: "color=blue+black+brown",
      // todo: original example from oas differs, https://github.com/OAI/OpenAPI-Specification/issues/4813
      // array: "color=blue%20black%20brown",
      object: "color=R+100+G+200+B+150",
      // todo: original example from oas differs, https://github.com/OAI/OpenAPI-Specification/issues/4813
      // object: "color=R%20100%20G%20200%20B%20150",
    },
    {
      explode: true,
      style: "pipeDelimited",
      // note: undefined by spec
      string: "color=blue",
      // note: undefined by spec
      array: "color=blue&color=black&color=brown",
      // note: undefined by spec
      object: "R=100&G=200&B=150",
    },
    {
      explode: false,
      style: "pipeDelimited",
      // note: undefined by spec
      string: "color=blue",
      array: "color=blue%7Cblack%7Cbrown",
      object: "color=R%7C100%7CG%7C200%7CB%7C150",
    },
    {
      explode: true,
      style: "deepObject",
      // note: undefined by spec
      string: "color=blue",
      // note: undefined by spec; using stripe expectation of `color[0]=blue&color[1]=black&color[2]=brown`
      array: "color%5B0%5D=blue&color%5B1%5D=black&color%5B2%5D=brown",
      object: "color%5BR%5D=100&color%5BG%5D=200&color%5BB%5D=150",
    },
    {
      explode: false,
      style: "deepObject",
      // note: undefined by spec
      string: "color=blue",
      // note: undefined by spec
      array: "color=blue%2Cblack%2Cbrown",
      // note: undefined by spec, using JSON.stringify representation
      object: "color=%7B%22R%22%3A100%2C%22G%22%3A200%2C%22B%22%3A150%7D",
    },
  ] as const)("oas 4.8.12.4 style examples - when explode: $explode and style: $style", ({
    explode,
    style,
    string,
    array,
    object,
  }) => {
    it("serializes a string correctly", () => {
      const actual = requestBodyToUrlSearchParams(
        {color: "blue"},
        {color: {explode, style}},
      )
      expect(actual.toString()).toStrictEqual(string)
    })

    it("serializes a array correctly", () => {
      const actual = requestBodyToUrlSearchParams(
        {color: ["blue", "black", "brown"]},
        {color: {explode, style}},
      )
      expect(actual.toString()).toStrictEqual(array)
    })

    it("serializes a object correctly", () => {
      const actual = requestBodyToUrlSearchParams(
        {color: {R: 100, G: 200, B: 150}},
        {
          color: {
            explode,
            style,
          },
        },
      )
      expect(actual.toString()).toStrictEqual(object)
    })
  })

  describe("stripe /v1 api conventions; style: 'deepObject' explode: true", () => {
    /**
     * conventions based on the way the stripe nodejs sdk is implemented at time of writing,
     * https://github.com/stripe/stripe-node/blob/67b2f17c813bef59635baa6d8b3f246a8c355431/src/utils.ts#L53-L69
     * excluding their use of raw `[` / `]` characters rather than percent-encoded brackets.
     */

    it("serializes a nested object correctly", () => {
      const actual = requestBodyToUrlSearchParams(
        {
          components: {
            account: {
              enabled: true,
              features: {
                some_flag: false,
                some_other_flag: true,
              },
            },
          },
        },
        {
          components: {
            explode: true,
            style: "deepObject",
          },
        },
      )
      expect(actual.toString()).toStrictEqual(
        "components%5Baccount%5D%5Benabled%5D=true&components%5Baccount%5D%5Bfeatures%5D%5Bsome_flag%5D=false&components%5Baccount%5D%5Bfeatures%5D%5Bsome_other_flag%5D=true",
      )
    })

    it("serializes a nested array correctly", () => {
      const actual = requestBodyToUrlSearchParams(
        {
          arr: ["red", "blue"],
        },
        {
          arr: {
            explode: true,
            style: "deepObject",
          },
        },
      )

      expect(actual.toString()).toStrictEqual("arr%5B0%5D=red&arr%5B1%5D=blue")
    })
  })

  describe("undefined / null handling", () => {
    it("omits undefined values", () => {
      const actual = requestBodyToUrlSearchParams({
        id: "123",
        description: null,
      })
      expect(actual.toString()).toStrictEqual("id=123")
    })
    it("omits null values", () => {
      const actual = requestBodyToUrlSearchParams({
        id: "123",
        description: undefined,
      })
      expect(actual.toString()).toStrictEqual("id=123")
    })
    it("includes empty string values", () => {
      const actual = requestBodyToUrlSearchParams({id: "123", description: ""})
      expect(actual.toString()).toStrictEqual("id=123&description=")
    })
    it("includes 0 number values", () => {
      const actual = requestBodyToUrlSearchParams({id: "123", description: 0})
      expect(actual.toString()).toStrictEqual("id=123&description=0")
    })
  })

  describe("explode: false, nested objects/arrays", () => {
    it("uses a JSON serialization when no defined alternative exists", () => {
      const actual = requestBodyToUrlSearchParams(
        {
          foo: {bar: {baz: true}},
        },
        {foo: {explode: false, style: "form"}},
      )

      expect(actual.toString()).toStrictEqual(
        "foo=bar%2C%7B%22baz%22%3Atrue%7D",
      )
    })
  })
})
