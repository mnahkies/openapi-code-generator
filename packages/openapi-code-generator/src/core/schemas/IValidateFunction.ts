import type {ErrorObject} from "ajv"

export interface ValidateFunction {
  (data: unknown): boolean

  errors?: null | ErrorObject[]
}
