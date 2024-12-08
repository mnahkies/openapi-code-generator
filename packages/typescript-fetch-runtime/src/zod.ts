import {z} from "zod"
import {responseValidationFactoryFactory} from "./common"

export const unknownEnumValue = z.unknown().brand("unknown enum value")
export type UnknownEnumValue = z.infer<typeof unknownEnumValue>

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
