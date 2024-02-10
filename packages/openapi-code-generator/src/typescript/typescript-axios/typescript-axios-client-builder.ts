/**
 * @prettier
 */

import {TypescriptClientBuilder} from "../common/client-builder"
import {ImportBuilder} from "../common/import-builder"
import {ClientOperationBuilder} from "../common/client-operation-builder"
import {asyncMethod, routeToTemplateString} from "../common/typescript-common"
import {union} from "../common/type-utils"

export class TypescriptAxiosClientBuilder extends TypescriptClientBuilder {
  protected buildImports(imports: ImportBuilder): void {
    imports
      .from("@nahkies/typescript-axios-runtime/main")
      .add("AbstractAxiosConfig", "AbstractAxiosClient")

    imports.from("axios").all("axios")

    imports.from("axios").add("AxiosRequestConfig", "AxiosResponse")
  }

  protected buildOperation(builder: ClientOperationBuilder): string {
    const {operationId, route, method} = builder
    const {requestBodyParameter} = builder.requestBodyAsParameter()

    const operationParameter = builder.methodParameter()

    const queryString = builder.queryString()
    const headers = builder.headers()

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

    const responseSchema = this.enableRuntimeResponseValidation
      ? builder.responseSchemas().specific[0] ??
        builder.responseSchemas().defaultResponse
      : null

    const axiosFragment = `this.axios.request({${[
      `url: url ${queryString ? "+ query" : ""}`,
      "baseURL: this.basePath",
      `method: "${method}"`,
      headers ? "headers" : "",
      requestBodyParameter ? "data: body" : "",
      "timeout",
      "...(opts ?? {})",
    ]
      .filter(Boolean)
      .join(",\n")}})`

    const body = `
    const url = \`${routeToTemplateString(route)}\`
    ${[
      headers ? `const headers = this._headers(${headers})` : "",
      queryString ? `const query = this._query({ ${queryString} })` : "",
      requestBodyParameter ? "const body = JSON.stringify(p.requestBody)" : "",
    ]
      .filter(Boolean)
      .join("\n")}

    ${
      responseSchema
        ? `const res = await ${axiosFragment}

    return {...res, data: ${responseSchema.schema}.parse(res.data)}
    `
        : `return ${axiosFragment}`
    }
`
    return asyncMethod({
      name: operationId,
      parameters: [
        operationParameter,
        {name: "timeout", type: "number", required: false},
        {name: "opts", type: "AxiosRequestConfig", required: false},
      ],
      returnType: `${returnType}`,
      body,
    })
  }

  protected buildClient(clientName: string, clientMethods: string[]): string {
    return `

export class ${clientName} extends AbstractAxiosClient {
  constructor(config: AbstractAxiosConfig) {
    super(config)
  }

  ${clientMethods.join("\n")}
}`
  }
}
