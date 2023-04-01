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
