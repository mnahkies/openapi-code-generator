import {TypescriptClientBuilder} from "../common/client-builder"
import type {ClientOperationBuilder} from "../common/client-operation-builder"
import type {ImportBuilder} from "../common/import-builder"
import {JoiBuilder} from "../common/schema-builders/joi-schema-builder"
import {ZodBuilder} from "../common/schema-builders/zod-schema-builder"
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

    if (this.config.enableRuntimeResponseValidation) {
      if (this.schemaBuilder instanceof ZodBuilder) {
        imports
          .from("@nahkies/typescript-fetch-runtime/zod")
          .add("responseValidationFactory")
      } else if (this.schemaBuilder instanceof JoiBuilder) {
        imports
          .from("@nahkies/typescript-fetch-runtime/joi")
          .add("responseValidationFactory")
      }
    }
  }

  protected buildOperation(builder: ClientOperationBuilder): string {
    const {operationId, route, method} = builder
    const {requestBodyParameter} = builder.requestBodyAsParameter()

    const operationParameter = builder.methodParameter()

    const queryString = builder.queryString()
    const headers = builder.headers()

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
      `method: "${method}",`,
      headers ? "headers," : "",
      requestBodyParameter ? "body," : "",
      "...opts",
    ]
      .filter(Boolean)
      .join("\n")}}, timeout)`

    const body = `
    const url = this.basePath + \`${routeToTemplateString(route)}\`
    ${[
      headers ? `const headers = this._headers(${headers})` : "",
      queryString ? `const query = this._query({ ${queryString} })` : "",
      requestBodyParameter ? "const body = JSON.stringify(p.requestBody)" : "",
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
        {name: "timeout", type: "number", required: false},
        {
          name: "opts",
          type: "RequestInit",
          required: true,
          default: "{}",
        },
      ],
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
