import {TypescriptClientBuilder} from "../common/client-builder"
import {ImportBuilder} from "../common/import-builder"
import {ClientOperationBuilder} from "../common/client-operation-builder"
import {asyncMethod, routeToTemplateString} from "../common/typescript-common"

export class TypescriptAxiosClientBuilder extends TypescriptClientBuilder {

  protected buildImports(imports: ImportBuilder): void {
    imports
      .from("axios")
      .all("axios")

    imports.from("axios").add("AxiosRequestConfig", "AxiosResponse")
  }

  protected buildOperation(builder: ClientOperationBuilder): string {
    const {operationId, route, method} = builder
    const {requestBodyParameter} = builder.requestBodyAsParameter()

    const operationParameter = builder.methodParameter()

    const queryString = builder.queryString()
    const headers = builder.headers()

    const returnType = builder.returnType()
      .filter(({statusType}) => statusType.startsWith("2"))
      .map(({ responseType}) => {
        return `AxiosResponse<${responseType}>`
      })
      .join(" | ") || "never"

    const body = `
const url = \`${routeToTemplateString(route)}\`
    ${
      [
        headers ? `const headers = this._headers(${headers})` : "",
        queryString ? `const query = this._query({ ${queryString} })` : "",
        requestBodyParameter ? "const body = JSON.stringify(p.requestBody)" : "",
      ]
        .filter(Boolean)
        .join("\n")
    }

    return axios.request({${
      [
        `url: url ${queryString ? "+ query" : ""}`,
        "baseURL: this.basePath",
        `method: "${method}"`,
        headers ? "headers" : "",
        requestBodyParameter ? "data: body" : "",
        "timeout",
        "...(opts ?? {})"
      ]
        .filter(Boolean)
        .join(",\n")
    }})
`
    return asyncMethod({
      name: operationId,
      parameters: [operationParameter, {name: "timeout", type: "number", required: false}, {name: "opts", type: "AxiosRequestConfig", required: false}],
      returnType: `${returnType}`,
      body,
    })
  }

  protected buildClient(clientName: string, clientMethods: string[]): string {
    return `

import qs from "qs"

// from https://stackoverflow.com/questions/39494689/is-it-possible-to-restrict-number-to-a-certain-range
type Enumerate<
  N extends number,
  Acc extends number[] = [],
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

export type Res<Status extends StatusCode, Type> = {
  status: Status
  json: () => Promise<Type>
}

export type TypedFetchResponse<R extends Res<any, any>> = Promise<
  Omit<Response, "json" | "status"> & R
> & {
  res: Promise<Omit<Response, "json" | "status"> & R>
  cancelRequest: AbortController
}

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

export type HeaderParams = Record<string, string | undefined>

export interface ${clientName}Config  {
  basePath: string
  defaultHeaders: Record<string, string>
  defaultTimeout?: number
}

export class ${clientName} {
protected readonly basePath: string
  protected readonly defaultHeaders: Record<string, string>
  protected readonly defaultTimeout?: number

  constructor(private readonly config: ${clientName}Config) {
    this.basePath = config.basePath
    this.defaultHeaders = config.defaultHeaders
    this.defaultTimeout = config.defaultTimeout
  }

  ${clientMethods.join("\n")}

  protected _query(params: QueryParams): string {
    const definedParams = Object.entries(params).filter(
      ([, v]) => v !== undefined,
    )

    if (!definedParams.length) {
      return ""
    }

    return (
      "?" + qs.stringify(Object.fromEntries(definedParams), {indices: false})
    )
  }

  protected _headers(headers: HeaderParams): Record<string, string> {
    return Object.fromEntries(
      Object.entries({...this.defaultHeaders, ...headers}).filter(
        (it): it is [string, string] => it[1] !== undefined,
      ),
    )
  }
}`
  }
}
