import type {z} from "zod/v3"
import {responseValidationFactoryFactory} from "./common.ts"

export function responseValidationFactory(
  possibleResponses: [string, z.ZodTypeAny][],
  defaultResponse?: z.ZodTypeAny,
) {
  return responseValidationFactoryFactory(
    (schema, value) => {
      return schema.parse(value)
    },
    possibleResponses,
    defaultResponse,
  )
}
