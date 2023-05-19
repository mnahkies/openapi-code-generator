import {TypescriptClientBuilder} from "../common/client-builder"
import {ImportBuilder} from "../common/import-builder"
import {ClientOperationBuilder} from "../common/client-operation-builder"
import {asyncMethod, routeToTemplateString} from "../common/typescript-common"

export class TypescriptFetchClientBuilder extends TypescriptClientBuilder {

  protected buildImports(imports: ImportBuilder): void {
    imports
      .from("@nahkies/typescript-fetch-runtime/main")
      .add(
        "AbstractFetchClientConfig",
        "AbstractFetchClient",
        "Res",
        "TypedFetchResponse",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
        "StatusCode",
      )
  }

  protected buildOperation(builder: ClientOperationBuilder): string {
    const {operationId, route, method} = builder
    const {requestBodyParameter} = builder.requestBodyAsParameter()

    const operationParameter = builder.methodParameter()

    const queryString = builder.queryString()
    const headers = builder.headers()

    const returnType = builder.returnType()
      .map(({statusType, responseType}) => {
        return `Res<${statusType},${responseType}>`
      })
      .join(" | ")

    const body = `
const url = this.basePath + \`${routeToTemplateString(route)}\`
    ${
      [
        headers ? `const headers = this._headers(${headers})` : "",
        queryString ? `const query = this._query({ ${queryString} })` : "",
        requestBodyParameter ? "const body = JSON.stringify(p.requestBody)" : "",
      ]
        .filter(Boolean)
        .join("\n")
    }

    return this._fetch(url ${queryString ? "+ query" : ""},
    {${
      [
        `method: "${method}",`,
        headers ? "headers," : "",
        requestBodyParameter ? "body," : "",
        "...(opts ?? {})"
      ]
        .filter(Boolean)
        .join("\n")
    }}, timeout)
`
    return asyncMethod({
      name: operationId,
      parameters: [operationParameter, {name: "timeout", type: "number", required: false}, {name: "opts", type: "RequestInit", required: false}],
      returnType: `TypedFetchResponse<${returnType}>`,
      body,
    })
  }

  protected buildClient(clientName: string, clientMethods: string[]): string {
    return `
export interface ${clientName}Config extends AbstractFetchClientConfig {}

export class ${clientName} extends AbstractFetchClient {
  constructor(config: ${clientName}Config) {
    super(config)
  }

  ${clientMethods.join("\n")}
}`
  }
}
