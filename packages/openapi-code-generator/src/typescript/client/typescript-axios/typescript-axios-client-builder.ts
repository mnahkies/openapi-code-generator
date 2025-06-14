import type {ImportBuilder} from "../../common/import-builder"
import {union} from "../../common/type-utils"
import {asyncMethod} from "../../common/typescript-common"
import {AbstractClientBuilder} from "../abstract-client-builder"
import type {ClientOperationBuilder} from "../client-operation-builder"

export class TypescriptAxiosClientBuilder extends AbstractClientBuilder {
  protected buildImports(imports: ImportBuilder): void {
    imports
      .from("@nahkies/typescript-axios-runtime/main")
      .add("AbstractAxiosConfig", "AbstractAxiosClient", "Server")

    imports.from("axios").all("axios")

    imports.from("axios").add("AxiosRequestConfig", "AxiosResponse")
  }

  protected buildOperation(builder: ClientOperationBuilder): string {
    const {operationId, method, hasServers} = builder
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

    const responseSchema = this.config.enableRuntimeResponseValidation
      ? (builder
          .responseSchemas()
          .specific.find((it) => it.statusType.startsWith("2")) ??
        builder.responseSchemas().defaultResponse)
      : null

    const axiosFragment = `this._request({${[
      `url: url ${queryString ? "+ query" : ""}`,
      `method: "${method}"`,
      requestBodyParameter ? "data: body" : "",
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
      requestBodyParameter ? "const body = JSON.stringify(p.requestBody)" : "",
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
}
