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
  input: unknown
): z.infer<Schema> | undefined {
  return schema?.parse(input)
}

export function responseValidationFactory(possibleResponses: [string, z.ZodTypeAny][]) {
  return (status: number, value: any) => {

    for(const [match, schema] of possibleResponses) {

      const isMatch = match === "default"
        || /^\\d+$/.test(match) && String(status) === match
        || /^\\dxx$/.test(match) && String(status)[0] === match[0]

      if(isMatch) {
        return schema.parse(value)
      }
    }
  }
}
