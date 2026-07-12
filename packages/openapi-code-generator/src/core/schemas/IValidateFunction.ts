import type {JsonSchemaErrors} from "@hyperjump/json-schema-errors"

export type ValidateFunction = (
  // biome-ignore lint/suspicious/noExplicitAny: unknown input
  data: any,
) => Promise<
  {isValid: true; errors: never[]} | {isValid: false; errors: JsonSchemaErrors}
>
