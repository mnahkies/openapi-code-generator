export interface IRRef {
  $ref: string
}

export interface IRModelBase {
  // Note: meaningless for top level objects, maybe we can exclude these somehow in that case
  nullable: boolean /* false */
  readOnly: boolean /* false */
}

export interface IRModelNumeric extends IRModelBase {
  type: "number"
  format?: "int32" | "int64" | "float" | "double" /* | string */
  enum?: number[]
}

export type IRModelStringFormat = "byte" | "binary" | "date" | "date-time" | "password" | "email"

export interface IRModelString extends IRModelBase {
  type: "string"
  format?: IRModelStringFormat
  enum?: string[]
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
  properties: { [propertyName: string]: MaybeIRModel }
  additionalProperties: boolean /* | IRObject */
}

export interface IRModelArray extends IRModelBase {
  type: "array"
  items: MaybeIRModel
}

export type IRModel = IRModelNumeric | IRModelString | IRModelBoolean | IRModelObject | IRModelArray
export type MaybeIRModel = IRModel | IRRef

export interface IRParameter {
  name: string
  in: "path" | "query" | "header" | "cookie" | "body"
  schema: MaybeIRModel
  description?: string
  required: boolean
  deprecated: boolean
  allowEmptyValue: boolean
}

export interface IROperation {
  route: string
  method: "GET" | "PUT" | "POST" | "PATCH" | "DELETE"
  parameters: IRParameter[]
  operationId: string
  tags: string[]
  requestBody?: IRRequestBody
  responses?: {
    [statusCode: number]: IRResponse
    default?: IRResponse
  }
  summary?: string
  description?: string
  deprecated: boolean
}

export interface IRRequestBody {
  description?: string
  required: boolean
  content: {
    [contentType: string]: IRMediaType
  }
}

export interface IRResponse {
  // todo: https://github.com/mnahkies/openapi-code-generator/issues/45
  headers: unknown
  description?: string
  content?: {
    [contentType: string]: IRMediaType
  }
}

export interface IRMediaType {
  schema: MaybeIRModel
  // todo: https://github.com/mnahkies/openapi-code-generator/issues/53
  encoding: unknown
}
