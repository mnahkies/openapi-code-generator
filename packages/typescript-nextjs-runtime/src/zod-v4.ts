import {findMatchingSchema} from "@nahkies/typescript-common-runtime/validation"
import type {z} from "zod/v4"
import {OpenAPIRuntimeError, type RequestInputType} from "./errors"

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
    throw OpenAPIRuntimeError.RequestError(err, type)
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
      const schema = findMatchingSchema(status, possibleResponses)

      if (schema) {
        return schema.parse(value)
      }

      if (defaultResponse) {
        return defaultResponse.parse(value)
      }

      // TODO: throw on unmatched response
      return value
    } catch (err) {
      throw OpenAPIRuntimeError.ResponseError(err)
    }
  }
}
