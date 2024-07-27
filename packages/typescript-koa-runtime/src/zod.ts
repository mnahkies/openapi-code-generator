import type {z} from "zod"
import {KoaRuntimeError, type RequestInputType} from "./errors"

export type Params<Params, Query, Body> = {
  params: Params
  query: Query
  body: Body
}

function isZodSchema(z: unknown): z is z.ZodTypeAny {
  return typeof z === "object" && z !== null && Reflect.has(z, "parse")
}

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
    throw KoaRuntimeError.RequestError(err, type)
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
      throw KoaRuntimeError.ResponseError(err)
    }
  }
}
