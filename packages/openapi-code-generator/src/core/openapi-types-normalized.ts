import type {Style} from "./openapi-types"
import type {HttpMethod} from "./utils"

export interface IRRef {
  "x-internal-preprocess"?: MaybeIRPreprocess | undefined
  $ref: string
}

export interface IRModelBase {
  // Note: meaningless for top level objects, maybe we can exclude these somehow in that case
  nullable: boolean /* false */
  readOnly: boolean /* false */
  default?: unknown | undefined
  "x-internal-preprocess"?: MaybeIRPreprocess | undefined
}

export type MaybeIRPreprocess = IRPreprocess | IRRef

export type IRPreprocess = {
  serialize?: {
    fn: string
    type?: string
  }
  deserialize?: {
    fn: string
    type?: string
  }
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

  "x-enum-extensibility"?: "open" | "closed" | undefined
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

  "x-enum-extensibility"?: "open" | "closed" | undefined
}

export interface IRModelBoolean extends IRModelBase {
  type: "boolean"
  enum?: string[] | undefined
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

export interface IRModelNever extends IRModelBase {
  type: "never"
}

export interface IRModelArray extends IRModelBase {
  type: "array"
  items: MaybeIRModel
  maxItems?: number | undefined
  minItems?: number | undefined
  uniqueItems: boolean
  // TODO: contains / maxContains / minContains
}

export interface IRModelNull extends IRModelBase {
  type: "null"
}

export type IRModel =
  | IRModelNumeric
  | IRModelString
  | IRModelBoolean
  | IRModelObject
  | IRModelArray
  | IRModelAny
  | IRModelNull
  | IRModelNever

export type MaybeIRModel = IRModel | IRRef

export interface IRServer {
  url: string
  description: string | undefined
  variables: IRServerVariable[]
}

export interface IRServerVariable {
  name: string
  enum: string[]
  default: string | undefined
  description: string | undefined
}

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
  servers: IRServer[]
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
  encoding: Record<string, IREncoding>
}

export interface IREncoding {
  style?: Style
  explode?: boolean
}
