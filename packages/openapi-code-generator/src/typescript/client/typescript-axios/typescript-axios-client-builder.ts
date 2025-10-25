import {isDefined} from "../../../core/utils"
import type {ImportBuilder} from "../../common/import-builder"
import {union} from "../../common/type-utils"
import {
  asyncMethod,
  type RequestBodyAsParameter,
} from "../../common/typescript-common"
import {AbstractClientBuilder} from "../abstract-client-builder"
import type {ClientOperationBuilder} from "../client-operation-builder"

export class TypescriptAxiosClientBuilder extends AbstractClientBuilder {
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
      .from("@nahkies/typescript-axios-runtime/main")
      .add("AbstractAxiosClient")
      .addType("AbstractAxiosConfig", "Server")

    imports
      .from("axios")
      .addType("AxiosRequestConfig", "AxiosResponse")
      .all("axios")
  }

  protected buildOperation(builder: ClientOperationBuilder): string {
    const {operationId, method, hasServers} = builder
    const requestBody = builder.requestBodyAsParameter()

    const operationParameter = builder.methodParameter()

    const queryString = builder.queryString()
    const headers = builder.headers({nullContentTypeValue: "false"})

    const returnType =
      union(
        builder
          .returnType()
          .filter(({statusType}) => statusType.startsWith("2"))
          .map(({responseType}) => `AxiosResponse<${responseType}>`),
      ) ||
      union(
        builder
          .returnType()
          .filter((it) => it.isDefault)
          .map(({responseType}) => `AxiosResponse<${responseType}>`),
      ) ||
      "AxiosResponse<void>"

    const responseSchema = this.config.enableRuntimeResponseValidation
      ? (builder
          .responseSchemas()
          .specific.find((it) => it.statusType.startsWith("2")) ??
        builder.responseSchemas().defaultResponse)
      : null

    const axiosFragment = `this._request({${[
      `url: url ${queryString ? "+ query" : ""}`,
      `method: "${method}"`,
      requestBody?.parameter
        ? requestBody.isSupported
          ? "data: body"
          : `// todo: request bodies with content-type '${requestBody.contentType}' not yet supported`
        : "",
      hasServers ? "baseURL: basePath" : undefined,
      // ensure compatibility with `exactOptionalPropertyTypes` compiler option
      // https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes
      "...(timeout ? {timeout} : {})",
      "...opts",
      "headers",
    ]
      .filter(Boolean)
      .join(",\n")}})`

    const body = `
    const url = \`${builder.routeToTemplateString()}\`
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
      responseSchema
        ? `const res = await ${axiosFragment}

    return {...res, data: ${this.schemaBuilder.parse(
      responseSchema.schema,
      "res.data",
    )}}
    `
        : `return ${axiosFragment}`
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
          type: "AxiosRequestConfig",
          required: true,
          default: "{}",
        },
      ],
      returnType: `${returnType}`,
      body,
    })
  }

  protected buildClient(clientName: string, clientMethods: string[]): string {
    const basePathType = this.basePathType()

    return `
export interface ${clientName}Config extends AbstractAxiosConfig {
  ${basePathType ? `basePath: ${basePathType}` : ""}
}

export class ${clientName} extends AbstractAxiosClient {
  constructor(config: ${clientName}Config) {
    super(config)
  }

  ${clientMethods.join("\n")}
}

${this.legacyExports(clientName)}
`
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
          `typescript-axios does not support request bodies of content-type '${requestBody.contentType}' using serializer '${requestBody.serializer satisfies never}'`,
        )
      }
    }
  }
}
