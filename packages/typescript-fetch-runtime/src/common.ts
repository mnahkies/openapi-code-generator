import type {Res, StatusCode} from "./types"

export function responseValidationFactoryFactory<Schema>(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  parse: (schema: Schema, value: unknown) => any,
  possibleResponses: [string, Schema][],
  defaultResponse?: Schema,
) {
  // Exploit the natural ordering matching the desired specificity of eg: 404 vs 4xx
  possibleResponses.sort((x, y) => (x[0] < y[0] ? -1 : 1))

  return async (
    whenRes: Promise<Res<StatusCode, unknown>>,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  ): Promise<any> => {
    const res = await whenRes

    const json = async () => {
      const status = res.status
      const value = await res.json()

      for (const [match, schema] of possibleResponses) {
        const isMatch =
          (/^\d+$/.test(match) && String(status) === match) ||
          (/^\d[xX]{2}$/.test(match) && String(status)[0] === match[0])

        if (isMatch) {
          return parse(schema, value)
        }
      }

      if (defaultResponse) {
        return parse(defaultResponse, value)
      }

      // TODO: throw on unmatched response?
      return value
    }

    return new Proxy(res, {
      get(target, prop) {
        if (prop === "json") {
          return json
        }

        const result = Reflect.get(target, prop)

        // undici does some mixin magic, where it's important that the `this` context
        // is correct, or else it'll fail to access #private properties on the response
        // https://github.com/nodejs/undici/blob/edf9b3ff8bfdf5099826b612d8a55572bb707086/lib/web/fetch/response.js#L310
        if (typeof result === "function") {
          return result.bind(target)
        }

        return result
      },
    })
  }
}
