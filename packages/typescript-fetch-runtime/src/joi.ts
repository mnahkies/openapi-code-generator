import type {Schema as JoiSchema} from "joi"
import {responseValidationFactoryFactory} from "./common"

export function responseValidationFactory(
  possibleResponses: [string, JoiSchema][],
  defaultResponse?: JoiSchema,
) {
  return responseValidationFactoryFactory(
    (schema, value) => {
      const result = schema.validate(value)

      if (result.error) {
        throw result.error
      }

      return result.value
    },
    possibleResponses,
    defaultResponse,
  )
}
