import type {z} from "zod"
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
