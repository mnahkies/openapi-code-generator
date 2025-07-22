import type {ImportBuilder} from "../../common/import-builder"
import {union} from "../../common/type-utils"
import {buildMethod} from "../../common/typescript-common"
import {AbstractClientBuilder} from "../abstract-client-builder"
import type {ClientOperationBuilder} from "../client-operation-builder"

export class AngularServiceBuilder extends AbstractClientBuilder {
  protected buildImports(imports: ImportBuilder): void {
    imports.from("@angular/core").add("Injectable")

    imports
      .from("@angular/common/http")
      .add("HttpClient", "HttpHeaders", "HttpParams", "HttpResponse")

    imports.from("rxjs").add("Observable")
  }

  protected buildOperation(builder: ClientOperationBuilder): string {
    const {operationId, method, hasServers} = builder
    const requestBody = builder.requestBodyAsParameter()

    const operationParameter = builder.methodParameter()

    const queryString = builder.queryString()
    const headers = builder.headers()

    const returnType = builder
      .returnType()
      .map(({statusType, responseType}) => {
        return `(HttpResponse<${responseType}> & {status: ${statusType}})`
      })
      .concat(["HttpResponse<unknown>"])
      .join(" | ")

    const url = builder.routeToTemplateString()

    const body = `
    ${[
      headers ? `const headers = this._headers(${headers})` : "",
      queryString ? `const params = this._queryParams({${queryString}})` : "",
      requestBody?.parameter && requestBody.isSupported
        ? `const body = ${builder.paramName(requestBody.parameter.name)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n")}

return this.httpClient.request<any>(
  "${method}",
  ${hasServers ? "basePath" : "this.config.basePath"} + \`${url}\`, {
    ${[
      queryString ? "params" : "",
      headers ? "headers" : "",
      requestBody?.parameter
        ? requestBody.isSupported
          ? "body"
          : `// todo: request bodies with content-type '${requestBody.contentType}' not yet supported`
        : "",
      'observe: "response"',
      "reportProgress: false",
    ]
      .filter(Boolean)
      .join(",\n")}
  });
`

    return buildMethod({
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
      ],
      returnType: `Observable<${returnType}>`,
      body,
    })
  }

  protected buildClient(clientName: string, clientMethods: string[]): string {
    const basePathType = this.basePathType()

    return `
export class ${clientName}Config {
  basePath: ${basePathType ? basePathType : "string"} = ${this.clientServersBuilder.default()}
  defaultHeaders: Record<string, string> = {}
}

// from https://stackoverflow.com/questions/39494689/is-it-possible-to-restrict-number-to-a-certain-range
type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>

type IntRange<F extends number, T extends number> = F extends T
  ? F
  : Exclude<Enumerate<T>, Enumerate<F>> extends never
  ? never
  : Exclude<Enumerate<T>, Enumerate<F>> | T

export type StatusCode1xx = IntRange<100, 199>
export type StatusCode2xx = IntRange<200, 299>
export type StatusCode3xx = IntRange<300, 399>
export type StatusCode4xx = IntRange<400, 499>
export type StatusCode5xx = IntRange<500, 599>
export type StatusCode =
  | StatusCode1xx
  | StatusCode2xx
  | StatusCode3xx
  | StatusCode4xx
  | StatusCode5xx

export type QueryParams = {
  [name: string]:
    | string
    | number
    | boolean
    | string[]
    | undefined
    | null
    | QueryParams
    | QueryParams[]
}

export type Server<T> = string & {__server__: T}

@Injectable({
  providedIn: 'root'
})
export class ${clientName} {
  constructor(
      private readonly httpClient: HttpClient,
      private readonly config: ${clientName}Config,
  ) {}

  private _headers(headers: Record<string, string|undefined>): Record<string, string> {
    return Object.fromEntries(
        Object.entries({...this.config.defaultHeaders, ...headers})
            .filter((it): it is [string,string] => it[1] !== undefined)
    )
  }

  private _queryParams(
    queryParams: QueryParams
  ): HttpParams {
    return Object.entries(queryParams).reduce((result, [name, value]) => {
      if (typeof value === "string" || typeof value === "boolean" || typeof value === "number") {
        return result.set(name, value)
      } else if (value === null || value === undefined) {
        return result
      }
      throw new Error(\`query parameter '\${name}' with value '\${value}' is not yet supported\`)
    }, new HttpParams())
  }


  ${clientMethods.join("\n")}
}

${this.legacyExports(clientName, true)}
`
  }
}
