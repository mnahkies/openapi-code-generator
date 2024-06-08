import type {z} from "zod"
import type {Res, StatusCode, TypedFetchResponse} from "./main"

export function responseValidationFactory(
  possibleResponses: [string, z.ZodTypeAny][],
  defaultResponse?: z.ZodTypeAny,
) {
  // Exploit the natural ordering matching the desired specificity of eg: 404 vs 4xx
  possibleResponses.sort((x, y) => (x[0] < y[0] ? -1 : 1))

  // TODO: avoid any
  return async (
    whenRes: TypedFetchResponse<Res<StatusCode, unknown>>,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  ): Promise<TypedFetchResponse<any>> => {
    const res = await whenRes

    return {
      ...res,
      json: async () => {
        const status = res.status
        const value = await res.json()

        for (const [match, schema] of possibleResponses) {
          const isMatch =
            (/^\d+$/.test(match) && String(status) === match) ||
            (/^\d[xX]{2}$/.test(match) && String(status)[0] === match[0])

          if (isMatch) {
            return schema.parse(value)
          }
        }

        if (defaultResponse) {
          return defaultResponse.parse(value)
        }

        // TODO: throw on unmatched response?
        return value
      },
    }
  }
}
