import {z} from "zod"

export type Params<Params, Query, Body> = { params: Params, query: Query, body: Body }

export function parseRequestInput<Schema extends z.ZodTypeAny>(
  schema: Schema,
  input: unknown
): z.infer<Schema>;
export function parseRequestInput(
  schema: undefined,
  input: unknown
): undefined;
export function parseRequestInput<Schema extends z.ZodTypeAny>(
  schema: Schema | undefined,
  input: unknown,
): z.infer<Schema> | undefined {
  return schema?.parse(input)
}

export function responseValidationFactory(possibleResponses: [string, z.ZodTypeAny][], defaultResponse?: z.ZodTypeAny) {

  // Exploit the natural ordering matching the desired specificity of eg: 404 vs 4xx
  possibleResponses.sort((x, y) => x[0] < y[0] ? -1 : 1)

  return (status: number, value: unknown) => {

    for (const [match, schema] of possibleResponses) {

      const isMatch =
        /^\d+$/.test(match) && String(status) === match ||
        /^\d[xX]{2}$/.test(match) && String(status)[0] === match[0]

      if (isMatch) {
        return schema.parse(value)
      }
    }

    if (defaultResponse) {
      return defaultResponse.parse(value)
    }

    return value
  }
}
