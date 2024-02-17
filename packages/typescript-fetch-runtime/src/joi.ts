import {type Schema as JoiSchema} from "@hapi/joi"
import {Res, StatusCode, TypedFetchResponse} from "./main"

export function responseValidationFactory(
  possibleResponses: [string, JoiSchema][],
  defaultResponse?: JoiSchema,
) {
  // Exploit the natural ordering matching the desired specificity of eg: 404 vs 4xx
  possibleResponses.sort((x, y) => (x[0] < y[0] ? -1 : 1))

  // TODO: avoid any
  return async (
    whenRes: TypedFetchResponse<Res<StatusCode, unknown>>,
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
            const result = schema.validate(value)

            if (result.error) {
              throw result.error
            }

            return result.value
          }
        }

        if (defaultResponse) {
          const result = defaultResponse.validate(value)

          if (result.error) {
            throw result.error
          }

          return result.value
        }

        // TODO: throw on unmatched response?
        return value
      },
    }
  }
}
