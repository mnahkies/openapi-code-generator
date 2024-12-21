import type {Schema as JoiSchema} from "joi"
import {KoaRuntimeError, type RequestInputType} from "./errors"

export type Params<Params, Query, Body> = {
  params: Params
  query: Query
  body: Body
}

// Note: joi types don't appear to have an equivalent of z.infer,
//       hence any seems about as good as we can do here.
export function parseRequestInput<Schema extends JoiSchema>(
  schema: Schema,
  input: unknown,
  type: RequestInputType,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): any
export function parseRequestInput(
  schema: undefined,
  input: unknown,
  type: RequestInputType,
): undefined
export function parseRequestInput<Schema extends JoiSchema>(
  schema: Schema | undefined,
  input: unknown,
  type: RequestInputType,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): any {
  try {
    if (!schema) {
      return undefined
    }

    const result = schema.validate(input, {stripUnknown: true})

    if (result.error) {
      throw result.error
    }

    return result.value
  } catch (err) {
    throw KoaRuntimeError.RequestError(err, type)
  }
}

export function responseValidationFactory(
  possibleResponses: [string, JoiSchema][],
  defaultResponse?: JoiSchema,
) {
  // Exploit the natural ordering matching the desired specificity of eg: 404 vs 4xx
  possibleResponses.sort((x, y) => (x[0] < y[0] ? -1 : 1))

  return (status: number, value: unknown) => {
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

    return value
  }
}
