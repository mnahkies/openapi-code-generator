import {isDefined} from "../../../core/utils"
import type {ImportBuilder} from "../../common/import-builder"
import {union} from "../../common/type-utils"
import {
  asyncMethod,
  type RequestBodyAsParameter,
} from "../../common/typescript-common"
import {AbstractClientBuilder} from "../abstract-client-builder"
import type {ClientOperationBuilder} from "../client-operation-builder"

export class TypescriptFetchClientBuilder extends AbstractClientBuilder {
  override capabilities = {
    requestBody: {
      mediaTypes: [
        "application/json",
        "application/scim+json",
        "application/merge-patch+json",
        "application/x-www-form-urlencoded",
        "text/json",
        "text/plain",
        "text/x-markdown",
      ],
    },
  }

  protected buildImports(imports: ImportBuilder): void {
    imports
      .from("@nahkies/typescript-fetch-runtime/main")
      .add("AbstractFetchClient")
      .addType(
        "AbstractFetchClientConfig",
        "Server",
        "Res",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
        "StatusCode",
      )

    const schemaBuilderType = this.schemaBuilder.type

    if (this.config.enableRuntimeResponseValidation) {
      switch (schemaBuilderType) {
        case "joi": {
          imports
            .from("@nahkies/typescript-fetch-runtime/joi")
            .add("responseValidationFactory")
          break
        }
        case "zod-v3": {
          imports
            .from("@nahkies/typescript-fetch-runtime/zod-v3")
            .add("responseValidationFactory")
          break
        }
        case "zod-v4": {
          imports
            .from("@nahkies/typescript-fetch-runtime/zod-v4")
            .add("responseValidationFactory")
          break
        }
        default: {
          throw new Error(
            `unsupported schema builder type '${schemaBuilderType satisfies never}'`,
          )
        }
      }
    }
  }

  protected buildOperation(builder: ClientOperationBuilder): string {
    const {operationId, method, hasServers} = builder
    const requestBody = builder.requestBodyAsParameter()

    const operationParameter = builder.methodParameter()

    const queryString = builder.queryString()
    const headers = builder.headers({nullContentTypeValue: "undefined"})

    const returnType = builder
      .returnType()
      .map(({statusType, responseType}) => {
        return `Res<${statusType},${responseType}>`
      })
      .join(" | ")

    const responseSchemas = this.config.enableRuntimeResponseValidation
      ? builder.responseSchemas()
      : null

    const fetchFragment = `this._fetch(url ${queryString ? "+ query" : ""},
    {${[
      `method: "${method}"`,
      requestBody?.parameter
        ? requestBody.isSupported
          ? "body"
          : `// todo: request bodies with content-type '${requestBody.contentType}' not yet supported`
        : "",
      "...opts",
      "headers",
    ]
      .filter(Boolean)
      .join(",\n")}}, timeout)`

    const body = `
    const url = ${hasServers ? "basePath" : "this.basePath"} + \`${builder.routeToTemplateString()}\`
    ${[
      headers
        ? `const headers = this._headers(${headers}, opts.headers)`
        : "const headers = this._headers({}, opts.headers)",
      queryString ? `const query = this._query({ ${queryString} })` : "",
      requestBody?.parameter && requestBody.isSupported
        ? `const body = ${this.serializeRequestBody(requestBody)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n")}

    ${
      responseSchemas
        ? `const res = ${fetchFragment}

    return responseValidationFactory([${responseSchemas.specific.map(
      (it) => `["${it.statusString}", ${it.schema}]`,
    )}], ${responseSchemas.defaultResponse?.schema})(res)
    `
        : `return ${fetchFragment}`
    }
`
    return asyncMethod({
      name: operationId,
      parameters: [
        operationParameter,
        hasServers
          ? {
              name: "basePath",
              type: union(
                this.clientServersBuilder.typeForOperationId(operationId),
                "string",
              ),
              default:
                this.clientServersBuilder.defaultForOperationId(operationId),
            }
          : undefined,
        {name: "timeout", type: "number", required: false},
        {
          name: "opts",
          type: "RequestInit",
          required: true,
          default: "{}",
        },
      ],
      returnType,
      body,
    })
  }

  private serializeRequestBody(requestBody: RequestBodyAsParameter) {
    if (!requestBody.serializer) {
      throw new Error(
        `missing serializer on requestBody ${JSON.stringify(requestBody, undefined, 2)}`,
      )
    }

    const param = `p.${requestBody.parameter.name}`

    switch (requestBody.serializer) {
      case "JSON.stringify": {
        const serialize = `JSON.stringify(${param})`

        if (requestBody.parameter.required) {
          return serialize
        }

        return `${param} !== undefined ? ${serialize} : null`
      }

      case "String": {
        const serialize = param

        if (requestBody.parameter.required) {
          return serialize
        }

        return `${param} !== undefined ? ${serialize} : null`
      }

      case "URLSearchParams": {
        const serialize = `this._requestBodyToUrlSearchParams(${[
          param,
          requestBody.encoding
            ? JSON.stringify(requestBody.encoding)
            : undefined,
        ]
          .filter(isDefined)
          .join(", ")})`

        if (requestBody.parameter.required) {
          return serialize
        }

        return `${param} !== undefined ? ${serialize} : null`
      }

      default: {
        throw new Error(
          `typescript-fetch does not support request bodies of content-type '${requestBody.contentType}' using serializer '${requestBody.serializer satisfies never}'`,
        )
      }
    }
  }

  protected buildClient(clientName: string, clientMethods: string[]): string {
    const basePathType = this.basePathType()

    return `
export interface ${clientName}Config extends AbstractFetchClientConfig {
  ${basePathType ? `basePath: ${basePathType}` : ""}
}

export class ${clientName} extends AbstractFetchClient {
  constructor(config: ${clientName}Config) {
    super(config)
  }

  ${clientMethods.join("\n")}
}

${this.legacyExports(clientName)}
`
  }
}
