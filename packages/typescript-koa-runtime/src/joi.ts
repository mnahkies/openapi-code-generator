import type {Schema as JoiSchema} from "@hapi/joi"

export type Params<Params, Query, Body> = { params: Params, query: Query, body: Body }

// Note: joi types don't appear to have an equivalent of z.infer,
//       hence any seems about as good as we can do here.
export function parseRequestInput<Schema extends JoiSchema>(
  schema: Schema,
  input: unknown
): any;
export function parseRequestInput(
  schema: undefined,
  input: unknown
): undefined;
export function parseRequestInput<Schema extends JoiSchema>(
  schema: Schema | undefined,
  input: unknown
): any {

  if (!schema) {
    return undefined
  }

  const result = schema.validate(input, {stripUnknown: true})

  if (result.error) {
    // TODO: improve error
    throw new Error("validation error")
  }

  return result.value
}
