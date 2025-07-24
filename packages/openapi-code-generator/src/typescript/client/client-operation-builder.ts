import {generationLib} from "../../core/generation-lib"
import type {Input} from "../../core/input"
import {logger} from "../../core/logger"
import type {
  IROperation,
  MaybeIRModel,
} from "../../core/openapi-types-normalized"
import {extractPlaceholders} from "../../core/openapi-utils"
import {camelCase, isDefined} from "../../core/utils"
import type {SchemaBuilder} from "../common/schema-builders/schema-builder"
import type {TypeBuilder} from "../common/type-builder"
import {
  combineParams,
  type MethodParameterDefinition,
  type RequestBodyAsParameter,
  requestBodyAsParameter,
  statusStringToType,
} from "../common/typescript-common"

export type ClientOperationResponseSchemas = {
  specific: {
    statusString: string
    statusType: string
    schema: string
    type: string
  }[]
  defaultResponse?:
    | {
        type: string
        schema: string
      }
    | undefined
}

export class ClientOperationBuilder {
  constructor(
    private readonly operation: IROperation,
    private readonly models: TypeBuilder,
    private readonly schemaBuilder: SchemaBuilder,
    private readonly input: Input,
    private readonly config: {
      supportedMediaTypes: string[]
    },
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

  get hasServers(): boolean {
    return this.operation.servers.length > 0
  }

  routeToTemplateString(paramName = "p"): string {
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

      return result.replace(
        wholeString,
        // TODO: why do we camelCase here? Feels presumptuous
        `\${${paramName}["${camelCase(placeholder)}"]}`,
      )
    }, route)
  }

  methodParameter(): MethodParameterDefinition | undefined {
    const {parameters} = this.operation
    const requestBody = this.requestBodyAsParameter()

    return combineParams(
      [...parameters, requestBody?.parameter].filter(isDefined).map((it) => ({
        name: `${camelCase(it.name)}`,
        type: this.models.schemaObjectToType(it.schema),
        required: it.required,
      })),
    )
  }

  requestBodyAsParameter(): RequestBodyAsParameter | undefined {
    const result = requestBodyAsParameter(
      this.operation,
      this.config.supportedMediaTypes,
    )
    const schema =
      result?.parameter?.schema && this.input.schema(result?.parameter?.schema)

    // todo: consider warning when serializer is URLSearchParams and the schema contains
    //       constructs that combined with encoding are undefined/implementation defined behavior
    if (schema) {
      if (this.models.isEmptyObject(schema)) {
        logger.warn(
          `[${this.route}]: skipping requestBody parameter that resolves to EmptyObject`,
        )
        return undefined
      }

      if (result?.serializer === "String" && schema.type !== "string") {
        throw new Error(
          "request bodies of content-type text/plain must have a string schema",
        )
      }
    }

    return result
  }

  queryString(): string {
    const {parameters} = this.operation

    // todo: consider style / explode / allowReserved etc here
    return parameters
      .filter((it) => it.in === "query")
      .map((it) => `'${it.name}': ${this.paramName(it.name)}`)
      .join(",\n")
  }

  headers(): string {
    const {parameters} = this.operation

    const paramHeaders = parameters
      .filter((it) => it.in === "header")
      .map((it) => `'${it.name}': ${this.paramName(it.name)}`)

    const hasAcceptHeader = this.hasHeader("Accept")
    const hasContentTypeHeader = this.hasHeader("Content-Type")
    const requestBody = this.requestBodyAsParameter()

    const result = [
      // todo: generate prioritized accept header on supported content-type union
      hasAcceptHeader ? undefined : "'Accept': 'application/json'",
      !hasContentTypeHeader &&
      requestBody?.contentType &&
      requestBody.isSupported
        ? `'Content-Type': '${requestBody.contentType}'`
        : undefined,
    ]
      .concat(paramHeaders)
      .filter(isDefined)

    return result.length ? `{${result.join(",\n")}}` : ""
  }

  hasHeader(name: string): boolean {
    const {parameters} = this.operation

    const parameter = parameters.find(
      (it) =>
        it.in === "header" && it.name.toLowerCase() === name.toLowerCase(),
    )

    return Boolean(parameter)
  }

  responseSchemas() {
    const schemaBuilder = this.schemaBuilder
    const models = this.models

    // todo: replace with responsesToArray / filter by supported content-types
    return Object.entries(this.operation.responses ?? {}).reduce(
      (acc, [status, response]) => {
        const content = Object.values(response.content ?? {}).pop()

        if (status === "default") {
          acc.defaultResponse = {
            schema: content
              ? schemaBuilder.fromModel(content.schema, true, true)
              : schemaBuilder.any(),
            type: content ? models.schemaObjectToType(content.schema) : "void",
          }
        } else {
          acc.specific.push({
            statusString: status,
            statusType: statusStringToType(status),
            type: content ? models.schemaObjectToType(content.schema) : "void",
            schema: content
              ? schemaBuilder.fromModel(content.schema, true, true)
              : schemaBuilder.any(),
          })
        }

        return acc
      },
      {
        specific: [],
        defaultResponse: undefined,
      } as ClientOperationResponseSchemas,
    )
  }

  returnType(): {
    statusType: string
    responseType: string
    isDefault: boolean
  }[] {
    const models = this.models

    return this.responsesToArray().map((it) => {
      return {
        statusType: statusStringToType(it.status),
        responseType: it.definition
          ? models.schemaObjectToType(it.definition)
          : "void",
        isDefault: it.status === "default",
      }
    })
  }

  paramName(name: string): string {
    return `p['${camelCase(name)}']`
  }

  private responsesToArray(): {
    status: string
    definition: null | MaybeIRModel
  }[] {
    const {responses} = this.operation

    if (!responses) {
      return [
        {
          status: "number",
          definition: {$ref: generationLib.UnknownObject$Ref},
        },
      ]
    }

    return Object.entries(responses).map(([status, response]) => {
      // todo: filter and union by supported content-type
      const responseContent = Object.values(response?.content || {}).pop()

      if (!responseContent) {
        return {status, definition: null}
      }

      return {status, definition: responseContent.schema}
    })
  }
}
