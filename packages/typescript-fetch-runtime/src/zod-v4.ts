import type {z} from "zod/v4"
import {responseValidationFactoryFactory} from "./common"

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
