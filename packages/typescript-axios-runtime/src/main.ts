import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type RawAxiosRequestHeaders,
} from "axios"
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

export type QueryParams = {
  [name: string]:
    | string
    | number
    | number[]
    | boolean
    | string[]
    | undefined
    | null
    | QueryParams
    | QueryParams[]
}

export type HeaderParams =
  | Record<string, string | number | undefined | null>
  | [string, string | number | undefined | null][]
  | Headers

export type Server<T> = string & {__server__: T}

export interface AbstractAxiosConfig {
  axios?: AxiosInstance
  basePath: string
  defaultHeaders?: Record<string, string>
  defaultTimeout?: number
}

export abstract class AbstractAxiosClient {
  protected readonly axios: AxiosInstance
  protected readonly basePath: string
  protected readonly defaultHeaders: Record<string, string>
  protected readonly defaultTimeout: number | undefined

  protected constructor(config: AbstractAxiosConfig) {
    this.axios = config.axios ?? axios
    this.basePath = config.basePath
    this.defaultHeaders = config.defaultHeaders ?? {}
    this.defaultTimeout = config.defaultTimeout
  }

  protected _request(opts: AxiosRequestConfig) {
    const headers = opts.headers ?? this._headers()

    return this.axios.request({
      baseURL: this.basePath,
      ...opts,
      headers,
    })
  }

  protected _query(params: QueryParams): string {
    const definedParams = Object.entries(params).filter(
      ([, v]) => v !== undefined,
    )

    if (!definedParams.length) {
      return ""
    }

    return `?${qs.stringify(Object.fromEntries(definedParams), {
      indices: false,
    })}`
  }

  /**
   * Combines headers for a request, with precedence
   * 1. default headers
   * 2. route level header parameters
   * 3. raw request config (escape hatch)
   *
   * following these rules:
   * - header values of `undefined` are skipped
   * - header values of `null` will remove/delete any previously set headers
   *
   * Eg:
   * Passing `Authorization: null` as a parameter, will clear out any
   * default `Authorization` header.
   *
   * But passing `Authorization: undefined` as parameter will fallthrough
   * to the default `Authorization` header.
   *
   * @param paramHeaders
   * @param optsHeaders
   * @protected
   */
  protected _headers(
    paramHeaders: HeaderParams = {},
    optsHeaders: AxiosRequestConfig["headers"] = {},
  ): RawAxiosRequestHeaders {
    const headers = new AxiosHeaders()

    // axios doesn't know how to append headers, so we just apply
    // from the lowest priority to highest.

    this.setHeaders(headers, this.defaultHeaders)
    this.setHeaders(headers, paramHeaders)
    this.setHeaders(headers, optsHeaders)

    return headers
  }

  private setHeaders(
    headers: Pick<Headers, "set" | "delete">,
    headersInit: HeaderParams | AxiosRequestConfig["headers"],
  ) {
    const headersArray = this.headersAsArray(headersInit)

    for (const [headerName, headerValue] of headersArray) {
      if (headerValue === null) {
        headers.delete(headerName)
      } else if (headerValue !== undefined) {
        headers.set(headerName.toLowerCase(), headerValue.toString())
      }
    }
  }

  private headersAsArray(
    headers: HeaderParams | AxiosRequestConfig["headers"],
  ): [string, string | number | undefined | null][] {
    if (Array.isArray(headers)) {
      return headers
    }

    if (headers instanceof Headers) {
      const result: [string, string][] = []
      headers.forEach((value, key) => {
        result.push([key, value])
      })
      return result
    }

    if (headers && typeof headers === "object") {
      return Object.entries(headers)
    }

    return []
  }
}
