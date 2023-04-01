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
  requestBody?: (RequestBody | Reference)
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
  // TODO support response headers
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
  // TODO support encoding
  encoding: unknown
}

export interface Components {
  schemas?: {
    [schemaName: string]: (Schema | Reference)
  }
  responses?: {
    [responseName: string]: Reference | Response
  }
  parameters?: {
    [parameterName: string]: (Parameter | Reference)
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
  title?: string
  multipleOf?: number
  maximum?: number
  exclusiveMaximum?: boolean
  minimum?: number
  exclusiveMinimum?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  maxItems?: number
  minItems?: number
  uniqueItems?: boolean
  maxProperties?: number
  minProperties?: number
  required?: string[] /* [] */
  enum?: string[] | number[]
  type?: "integer" | "number" | "string" | "boolean" | "object" | "array" /* object */
  not?: Schema | Reference
  allOf?: (Schema | Reference)[]
  oneOf?: (Schema | Reference)[]
  anyOf?: (Schema | Reference)[]
  items?: Schema | Reference
  properties?: { [propertyName: string]: Schema | Reference }
  additionalProperties?: boolean | Schema | Reference
  format?: "int32" | "int64" | "float" | "double" | "byte" | "binary" | "date" | "date-time" | "password" | "email"
  default?: unknown
  nullable?: boolean /* false */
  discriminator?: Discriminator
  readOnly?: boolean /* false */
  writeOnly?: boolean
  example?: unknown
  externalDocs?: ExternalDocumentation
  deprecated?: boolean
  // xml?: XML;
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
