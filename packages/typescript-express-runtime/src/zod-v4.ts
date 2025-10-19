import type {z} from "zod/v4"
import {ExpressRuntimeError, type RequestInputType} from "./errors"

export function parseRequestInput<Schema extends z.ZodTypeAny>(
  schema: Schema,
  input: unknown,
  type: RequestInputType,
): z.infer<Schema>
export function parseRequestInput(
  schema: undefined,
  input: unknown,
  type: RequestInputType,
): undefined
export function parseRequestInput<Schema extends z.ZodTypeAny>(
  schema: Schema | undefined,
  input: unknown,
  type: RequestInputType,
): z.infer<Schema> | undefined {
  try {
    return schema?.parse(input)
  } catch (err) {
    throw ExpressRuntimeError.RequestError(err, type)
  }
}

// TODO: optional response validation
export function responseValidationFactory(
  possibleResponses: [string, z.ZodTypeAny][],
  defaultResponse?: z.ZodTypeAny,
) {
  // Exploit the natural ordering matching the desired specificity of eg: 404 vs 4xx
  possibleResponses.sort((x, y) => (x[0] < y[0] ? -1 : 1))

  return (status: number, value: unknown) => {
    try {
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

      // TODO: throw on unmatched response
      return value
    } catch (err) {
      throw ExpressRuntimeError.ResponseError(err)
    }
  }
}
