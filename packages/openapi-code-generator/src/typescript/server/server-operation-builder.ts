import type {Input} from "../../core/input"
import {logger} from "../../core/logger"
import type {
  IRModelObject,
  IROperation,
  IRParameter,
} from "../../core/openapi-types-normalized"
import {extractPlaceholders} from "../../core/openapi-utils"
import {upperFirst} from "../../core/utils"
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
  paramSchema: string
  querySchema: string
  requestBodySchema: string
  requestHeaderSchema: string
  responseBodyValidator: string
}

export function reduceParamsToOpenApiSchema(
  parameters: IRParameter[],
): IRModelObject {
  return parameters.reduce(
    (model, parameter) => {
      model.properties[parameter.name] = parameter.schema

      if (parameter.required) {
        model.required.push(parameter.name)
      }

      return model
    },
    {
      type: "object",
      properties: {},
      required: [],
      oneOf: [],
      allOf: [],
      anyOf: [],
      additionalProperties: false,
      nullable: false,
      readOnly: false,
    } as IRModelObject,
  )
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
    schema: string | undefined
    type: string
  }
  query: {
    schema: string | undefined
    type: string
  }
  header: {
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
    private readonly config: {supportedMediaTypes: string[]},
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

      const parameter = parameters.find(
        (it) => it.name === placeholder && it.in === "path",
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

  parameters(symbols: ServerSymbols): Parameters {
    const path = this.pathParameters(symbols.paramSchema)
    const query = this.queryParameters(symbols.querySchema)
    const header = this.headerParameters(symbols.requestHeaderSchema)
    const body = this.requestBodyParameter(symbols.requestBodySchema)

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

  private pathParameters(schemaSymbolName: string): Parameters["path"] {
    const parameters = this.operation.parameters.filter(
      (it) => it.in === "path",
    )

    const schema = parameters.length
      ? this.schemaBuilder.fromParameters(parameters)
      : undefined

    let type = "void"

    if (schema) {
      type = this.types.schemaObjectToType(
        this.input.loader.addVirtualType(
          this.operationId,
          upperFirst(schemaSymbolName),
          reduceParamsToOpenApiSchema(parameters),
        ),
      )
    }

    return {schema: schema, type}
  }

  private queryParameters(schemaSymbolName: string): Parameters["query"] {
    const parameters = this.operation.parameters.filter(
      (it) => it.in === "query",
    )

    const schema = parameters.length
      ? this.schemaBuilder.fromParameters(parameters)
      : undefined

    let type = "void"

    if (schema) {
      type = this.types.schemaObjectToType(
        this.input.loader.addVirtualType(
          this.operationId,
          upperFirst(schemaSymbolName),
          reduceParamsToOpenApiSchema(parameters),
        ),
      )
    }

    return {schema: schema, type}
  }

  private headerParameters(schemaSymbolName: string): Parameters["header"] {
    const parameters = this.operation.parameters
      .filter((it) => it.in === "header")
      .map((it) => ({...it, name: it.name.toLowerCase()}))

    const schema = parameters.length
      ? this.schemaBuilder.fromParameters(parameters)
      : undefined

    let type = "void"

    if (schema) {
      type = this.types.schemaObjectToType(
        this.input.loader.addVirtualType(
          this.operationId,
          upperFirst(schemaSymbolName),
          reduceParamsToOpenApiSchema(parameters),
        ),
      )
    }

    return {schema: schema, type}
  }

  private requestBodyParameter(schemaSymbolName: string): Parameters["body"] {
    const requestBody = requestBodyAsParameter(
      this.operation,
      this.config.supportedMediaTypes,
    )

    const isRequired = Boolean(requestBody?.parameter?.required)

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
      type = this.types.schemaObjectToType(
        this.input.loader.addVirtualType(
          this.operationId,
          upperFirst(schemaSymbolName),
          this.input.schema(requestBody.parameter.schema),
        ),
      )
    }

    return {
      isSupported: Boolean(requestBody?.isSupported),
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
