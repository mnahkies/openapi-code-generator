import type {HttpMethod} from "./utils"

export interface IRRef {
  $ref: string
}

export interface IRModelBase {
  // Note: meaningless for top level objects, maybe we can exclude these somehow in that case
  nullable: boolean /* false */
  readOnly: boolean /* false */

  "x-alpha-transform"?:
    | {
        fn?: string | undefined
        type?: string | undefined
      }
    | undefined
}

export type IRModelNumericFormat = "int32" | "int64" | "float" | "double"

export interface IRModelNumeric extends IRModelBase {
  type: "number"
  format?: IRModelNumericFormat | string | undefined
  enum?: number[] | undefined
  exclusiveMaximum?: number | undefined
  exclusiveMinimum?: number | undefined
  maximum?: number | undefined
  minimum?: number | undefined
  multipleOf?: number | undefined
}

export type IRModelStringFormat =
  | "byte"
  | "binary"
  | "date"
  | "date-time"
  | "password"
  | "email"

export interface IRModelString extends IRModelBase {
  type: "string"
  format?: IRModelStringFormat | string | undefined
  enum?: string[] | undefined
  maxLength?: number | undefined
  minLength?: number | undefined
  pattern?: string | undefined
}

export interface IRModelBoolean extends IRModelBase {
  type: "boolean"
}

export interface IRModelObject extends IRModelBase {
  allOf: MaybeIRModel[]
  oneOf: MaybeIRModel[]
  anyOf: MaybeIRModel[]

  type: "object"
  required: string[]
  properties: {[propertyName: string]: MaybeIRModel}
  additionalProperties: undefined | boolean | MaybeIRModel
}

export interface IRModelAny extends IRModelBase {
  type: "any"
}

export interface IRModelArray extends IRModelBase {
  type: "array"
  items: MaybeIRModel
  maxItems?: number | undefined
  minItems?: number | undefined
  uniqueItems: boolean
  // TODO: contains / maxContains / minContains
}

export type IRModel =
  | IRModelNumeric
  | IRModelString
  | IRModelBoolean
  | IRModelObject
  | IRModelArray
  | IRModelAny

export type MaybeIRModel = IRModel | IRRef

export interface IRParameter {
  name: string
  in: "path" | "query" | "header" | "cookie" | "body"
  schema: MaybeIRModel
  description: string | undefined
  required: boolean
  deprecated: boolean
  allowEmptyValue: boolean
}

export interface IROperation {
  route: string
  method: HttpMethod
  parameters: IRParameter[]
  operationId: string
  tags: string[]
  requestBody: IRRequestBody | undefined
  responses:
    | {
        [statusCode: number]: IRResponse
        default?: IRResponse
      }
    | undefined
  summary: string | undefined
  description: string | undefined
  deprecated: boolean
}

export interface IRRequestBody {
  description: string | undefined
  required: boolean
  content: {
    [contentType: string]: IRMediaType
  }
}

export interface IRResponse {
  // todo: https://github.com/mnahkies/openapi-code-generator/issues/45
  headers: unknown
  description: string | undefined
  content?: {
    [contentType: string]: IRMediaType
  }
}

export interface IRMediaType {
  schema: MaybeIRModel
  // todo: https://github.com/mnahkies/openapi-code-generator/issues/53
  encoding: unknown
}
