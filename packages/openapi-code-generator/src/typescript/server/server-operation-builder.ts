import type {Input} from "../../core/input"
import {logger} from "../../core/logger"
import type {IROperation} from "../../core/openapi-types-normalized"
import {extractPlaceholders} from "../../core/openapi-utils"
import type {SchemaBuilder} from "../common/schema-builders/schema-builder"
import type {TypeBuilder} from "../common/type-builder"
import {intersect, object} from "../common/type-utils"
import {
  requestBodyAsParameter,
  statusStringToType,
} from "../common/typescript-common"

export type ServerSymbols = {
  implPropName: string
  implTypeName: string
  responderName: string
  responseBodyValidator: string
}

export type ServerOperationResponseSchemas = {
  specific: {
    statusString: string
    statusType: string
    schema: string
    type: string
    isWildCard: boolean
  }[]
  defaultResponse?:
    | {
        type: string
        schema: string
      }
    | undefined
}

export type Parameters = {
  type: string
  path: {
    name: string
    schema: string | undefined
    type: string
  }
  query: {
    name: string
    schema: string | undefined
    type: string
  }
  header: {
    name: string
    schema: string | undefined
    type: string
  }
  body: {
    isSupported: boolean
    contentType: string | undefined
    schema: string | undefined
    type: string
    isRequired: boolean
  }
}

export class ServerOperationBuilder {
  constructor(
    private readonly operation: IROperation,
    private readonly input: Input,
    private readonly types: TypeBuilder,
    private readonly schemaBuilder: SchemaBuilder,
    private readonly config: {requestBody: {supportedMediaTypes: string[]}},
  ) {}

  get operationId(): string {
    return this.operation.operationId
  }

  get route(): string {
    const {route, parameters} = this.operation

    const placeholders = extractPlaceholders(route)

    return placeholders.reduce((result, {placeholder, wholeString}) => {
      if (!placeholder) {
        throw new Error(
          `invalid route parameter placeholder in route '${route}'`,
        )
      }

      const parameter = parameters.path.list.find(
        (it) => it.name === placeholder,
      )

      if (!parameter) {
        throw new Error(
          `invalid route ${route}. missing path parameter for '${placeholder}'`,
        )
      }

      return result.replace(wholeString, `:${placeholder}`)
    }, route)
  }

  get method(): string {
    return this.operation.method
  }

  parameters(): Parameters {
    const path = this.pathParameters()
    const query = this.queryParameters()
    const header = this.headerParameters()
    const body = this.requestBodyParameter()

    const type = `Params<
      ${path.type},
      ${query.type},
      ${body.type + (body.type === "void" || body.isRequired ? "" : " | undefined")},
      ${header.type}
    >`

    return {type, path, query, header, body}
  }

  responseValidator(): string {
    const {specific, defaultResponse} = this.responseSchemas()

    const pairs = specific.map((it) => `["${it.statusString}", ${it.schema}]`)

    return `responseValidationFactory([${pairs}], ${defaultResponse?.schema})`
  }

  responder(
    responderType: string,
    runtimeResponseType: string,
  ): {
    implementation: string
    type: string
  } {
    const {specific, defaultResponse} = this.responseSchemas()

    const type = intersect(
      object([
        ...specific.map((it) =>
          it.isWildCard
            ? `with${it.statusType}(status: ${it.statusType}): ${runtimeResponseType}<${it.type}>`
            : `with${it.statusType}(): ${runtimeResponseType}<${it.type}>`,
        ),
        defaultResponse &&
          `withDefault(status: StatusCode): ${runtimeResponseType}<${defaultResponse.type}>`,
      ]),
      responderType,
    )

    const implementation = object([
      ...specific.map((it) =>
        it.isWildCard
          ? `with${it.statusType}(status: ${it.statusType}) {return new ${runtimeResponseType}<${it.type}>(status) }`
          : `with${it.statusType}() {return new ${runtimeResponseType}<${it.type}>(${it.statusType}) }`,
      ),
      defaultResponse &&
        `withDefault(status: StatusCode) { return new ${runtimeResponseType}<${defaultResponse.type}>(status) }`,
      `withStatus(status: StatusCode) { return new ${runtimeResponseType}(status)}`,
    ])

    return {implementation, type}
  }

  private pathParameters(): Parameters["path"] {
    const $ref = this.operation.parameters.path.$ref

    const schema = $ref
      ? this.schemaBuilder.fromModel(this.input.schema($ref), true, true)
      : undefined

    let type = "void"

    if ($ref && schema) {
      type = this.types.schemaObjectToType($ref)
    }

    return {name: this.operation.parameters.path.name, schema: schema, type}
  }

  private queryParameters(): Parameters["query"] {
    const $ref = this.operation.parameters.query.$ref

    const schema = $ref
      ? this.schemaBuilder.fromModel(this.input.schema($ref), true, true)
      : undefined

    let type = "void"

    if ($ref && schema) {
      type = this.types.schemaObjectToType($ref)
    }

    return {name: this.operation.parameters.query.name, schema: schema, type}
  }

  private headerParameters(): Parameters["header"] {
    const $ref = this.operation.parameters.header.$ref

    const schema = $ref
      ? this.schemaBuilder.fromModel(this.input.schema($ref), true, true)
      : undefined

    let type = "void"

    if ($ref && schema) {
      type = this.types.schemaObjectToType($ref)
    }

    return {name: this.operation.parameters.header.name, schema: schema, type}
  }

  private requestBodyParameter(): Parameters["body"] {
    const requestBody = requestBodyAsParameter(
      this.operation,
      this.config.requestBody.supportedMediaTypes,
    )

    const isRequired = Boolean(requestBody?.parameter?.required)
    const isSupported = Boolean(requestBody?.isSupported)

    const schema = requestBody?.parameter
      ? this.schemaBuilder.fromModel(
          requestBody.parameter.schema,
          requestBody.parameter.required,
          true,
        )
      : undefined

    if (
      requestBody?.parameter &&
      this.types.isEmptyObject(requestBody.parameter.schema)
    ) {
      logger.warn(
        `[${this.route}]: skipping requestBody parameter that resolves to EmptyObject`,
      )
      return {
        isSupported: true,
        type: "void",
        contentType: undefined,
        schema: undefined,
        isRequired: false,
      }
    }

    let type = "void"

    if (schema && requestBody?.parameter) {
      type = this.types.schemaObjectToType(requestBody.parameter.schema)
    }

    return {
      isSupported,
      contentType: requestBody?.contentType,
      schema,
      type,
      isRequired,
    }
  }

  responseSchemas(): ServerOperationResponseSchemas {
    const schemaBuilder = this.schemaBuilder
    const types = this.types

    return Object.entries(this.operation.responses ?? {}).reduce(
      (acc, [status, response]) => {
        const content = Object.values(response.content ?? {}).pop()

        if (status === "default") {
          acc.defaultResponse = {
            schema: content
              ? schemaBuilder.fromModel(content.schema, true, true)
              : schemaBuilder.void(),
            type: content ? types.schemaObjectToType(content.schema) : "void",
          }
        } else {
          acc.specific.push({
            statusString: status,
            statusType: statusStringToType(status),
            type: content ? types.schemaObjectToType(content.schema) : "void",
            schema: content
              ? schemaBuilder.fromModel(content.schema, true, true)
              : schemaBuilder.void(),
            isWildCard: /^\d[xX]{2}$/.test(status),
          })
        }

        return acc
      },
      {
        specific: [],
        defaultResponse: undefined,
      } as ServerOperationResponseSchemas,
    )
  }
}
