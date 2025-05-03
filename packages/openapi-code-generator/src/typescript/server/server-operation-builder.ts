import type {Input} from "../../core/input"
import type {
  IRModelObject,
  IROperation,
  IRParameter,
} from "../../core/openapi-types-normalized"
import {upperFirst} from "../../core/utils"
import type {SchemaBuilder} from "../common/schema-builders/schema-builder"
import type {TypeBuilder} from "../common/type-builder"
import {intersect, object} from "../common/type-utils"
import {
  requestBodyAsParameter,
  statusStringToType,
} from "../common/typescript-common"
import type {ServerSymbols} from "./typescript-koa/typescript-koa.generator"

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
  ) {}

  get operationId(): string {
    return this.operation.operationId
  }

  get route(): string {
    return this.operation.route
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

  responder(): {implementation: string; type: string} {
    const {specific, defaultResponse} = this.responseSchemas()
    // TODO: figure out what to do about the KoaRuntimeResponse class
    const type = intersect(
      object([
        ...specific.map((it) =>
          it.isWildCard
            ? `with${it.statusType}(status: ${it.statusType}): KoaRuntimeResponse<${it.type}>`
            : `with${it.statusType}(): KoaRuntimeResponse<${it.type}>`,
        ),
        defaultResponse &&
          `withDefault(status: StatusCode): KoaRuntimeResponse<${defaultResponse.type}>`,
      ]),
      "KoaRuntimeResponder",
    )

    const implementation = object([
      ...specific.map((it) =>
        it.isWildCard
          ? `with${it.statusType}(status: ${it.statusType}) {return new KoaRuntimeResponse<${it.type}>(status) }`
          : `with${it.statusType}() {return new KoaRuntimeResponse<${it.type}>(${it.statusType}) }`,
      ),
      defaultResponse &&
        `withDefault(status: StatusCode) { return new KoaRuntimeResponse<${defaultResponse.type}>(status) }`,
      "withStatus(status: StatusCode) { return new KoaRuntimeResponse(status)}",
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
    const {requestBodyParameter} = requestBodyAsParameter(this.operation)
    const isRequired = Boolean(requestBodyParameter?.required)
    const schema = requestBodyParameter
      ? this.schemaBuilder.fromModel(
          requestBodyParameter.schema,
          requestBodyParameter.required,
          true,
        )
      : undefined
    let type = "void"

    if (schema && requestBodyParameter) {
      type = this.types.schemaObjectToType(
        this.input.loader.addVirtualType(
          this.operationId,
          upperFirst(schemaSymbolName),
          this.input.schema(requestBodyParameter.schema),
        ),
      )
    }

    return {
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
