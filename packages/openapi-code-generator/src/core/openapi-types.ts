export interface OpenapiDocument {
  openapi: "3.0.3"
  info: Info
  servers?: Server[]
  externalDocs?: ExternalDocumentation
  security?: SecurityRequirement[]
  tags?: Tag[]
  paths?: Paths
  components?: Components
}

export interface Info {
  title: string
  version: string
  description?: string
  termsOfService?: string
  contact?: Contact
  license?: License
}

export interface Contact {
  name?: string
  url?: string
  email?: string
}

export interface License {
  name: string
  url?: string
}

export interface ExternalDocumentation {
  description?: string
  url: string
}

export interface Server {
  url: string
  description?: string
  variables?: {
    [k: string]: ServerVariable
  }
}

export interface ServerVariable {
  enum?: string[]
  default: string
  description?: string
}

export interface SecurityRequirement {
  // where string is a keyof OpenapiDefinition["components"]["securitySchemes"]
  [k: string]: string[]
}

export interface Tag {
  name: string
  description?: string
  externalDocs?: ExternalDocumentation
}

export interface Paths {
  [route: string]: Path | Reference
}

export interface Path {
  summary?: string
  description?: string
  servers?: Server[]
  parameters?: (Parameter | Reference)[]
  get?: Operation
  put?: Operation
  post?: Operation
  delete?: Operation
  options?: Operation
  head?: Operation
  patch?: Operation
  trace?: Operation
}

export interface Operation {
  tags?: string[]
  summary?: string
  description?: string
  externalDocs?: ExternalDocumentation
  operationId?: string
  parameters?: (Parameter | Reference)[]
  requestBody?: RequestBody | Reference
  responses?: Responses
  callbacks?: {
    [key: string]: Callback | Reference
  }
  deprecated?: boolean
  security?: SecurityRequirement[]
  servers?: Server[]
}

export interface RequestBody {
  description?: string
  content: {
    [contentType: string]: MediaType
  }
  required?: boolean
}

export interface Responses {
  [statusCode: string]: Response | Reference | undefined

  default?: Response | Reference
}

export interface Response {
  description?: string
  // todo: https://github.com/mnahkies/openapi-code-generator/issues/45
  headers?: {
    [headerName: string]: Header | Reference
  }
  content?: {
    [contentType: string]: MediaType
  }
  links?: {
    [linkName: string]: Link | Reference
  }
}

export interface Link {
  operationId?: string
  operationRef?: string
  parameters?: {
    [k: string]: unknown
  }
  requestBody?: unknown
  description?: string
  server?: Server
}

export interface Callback {
  [k: string]: Path
}

export interface MediaType {
  schema: Schema | Reference
  // todo: https://github.com/mnahkies/openapi-code-generator/issues/53
  encoding: unknown
}

export interface Components {
  schemas?: {
    [schemaName: string]: Schema | Reference
  }
  responses?: {
    [responseName: string]: Reference | Response
  }
  parameters?: {
    [parameterName: string]: Parameter | Reference
  }
  examples?: {
    [exampleName: string]: Example | Reference
  }
  requestBodies?: {
    [requestBodyName: string]: RequestBody | Reference
  }
  headers?: {
    [headerName: string]: Header | Reference
  }
  securitySchemes?: {
    [securitySchemaName: string]: SecurityScheme | Reference
  }
  links?: {
    [linkName: string]: Link | Reference
  }
  callbacks?: {
    [callbackName: string]: Callback | Reference
  }
}

export interface Header {
  schema: Schema | Reference
  description?: string
  required?: boolean
  deprecated?: boolean
  allowEmptyValue?: boolean
}

export interface Parameter {
  name: string
  in: "path" | "query" | "header" | "cookie"
  schema: Schema | Reference
  description?: string
  required?: boolean
  deprecated?: boolean
  allowEmptyValue?: boolean
}

export interface Schema {
  title?: string | undefined
  multipleOf?: number | undefined
  maximum?: number | undefined
  exclusiveMaximum?: number | undefined
  minimum?: number | undefined
  exclusiveMinimum?: number | undefined
  maxLength?: number | undefined
  minLength?: number | undefined
  pattern?: string | undefined
  maxItems?: number | undefined
  minItems?: number | undefined
  uniqueItems?: boolean | undefined
  maxProperties?: number | undefined
  minProperties?: number | undefined
  required?: string[] /* [] */ | undefined
  enum?: string[] | number[] | undefined
  type?:
    | "integer"
    | "number"
    | "string"
    | "boolean"
    | "object"
    | "array"
    | "null" // only valid in OA 3.1
    | string
    | undefined
  not?: Schema | Reference | undefined
  allOf?: (Schema | Reference)[] | undefined
  oneOf?: (Schema | Reference)[] | undefined
  anyOf?: (Schema | Reference)[] | undefined
  items?: Schema | Reference | undefined
  properties?: {[propertyName: string]: Schema | Reference} | undefined
  additionalProperties?: boolean | Schema | Reference | undefined
  format?:
    | "int32"
    | "int64"
    | "float"
    | "double"
    | "byte"
    | "binary"
    | "date"
    | "date-time"
    | "password"
    | "email"
    | string
    | undefined
  default?: unknown | undefined
  nullable?: boolean | undefined
  discriminator?: Discriminator | undefined
  readOnly?: boolean | undefined
  writeOnly?: boolean | undefined
  example?: unknown | undefined
  externalDocs?: ExternalDocumentation | undefined
  deprecated?: boolean | undefined
  // xml?: XML | undefined

  "x-internal-preprocess"?: xInternalPreproccess | Reference | undefined
}

export interface xInternalPreproccess {
  serialize?: {
    fn: string
    type?: string
  }
  deserialize?: {
    fn: string
    type?: string
  }
}

export interface Discriminator {
  propertyName: string
  mapping?: {
    [k: string]: string
  }
}

export interface Example {
  summary?: string
  description?: string
  value?: unknown
  externalValue?: string
}

export interface Reference {
  "x-internal-preprocess"?: xInternalPreproccess | Reference | undefined
  $ref: string
}

export interface SecurityScheme {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect"
  description?: string
  name: string
  in: "query" | "header" | "cookie"
  scheme?: string
  bearerFormat?: string
  flows?: unknown
  openIdConnectUrl?: string
}
