import {
  type Encoding,
  requestBodyToUrlSearchParams,
} from "@nahkies/typescript-common-runtime/request-bodies/url-search-params"
import type {
  HeaderParams,
  QueryParams,
} from "@nahkies/typescript-common-runtime/types"
import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type RawAxiosRequestHeaders,
} from "axios"
import qs from "qs"

export type {
  HeaderParams,
  QueryParams,
  Server,
} from "@nahkies/typescript-common-runtime/types"

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

  protected _request<R extends AxiosResponse>(
    opts: AxiosRequestConfig,
  ): Promise<R> {
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

  protected _requestBodyToUrlSearchParams(
    obj: Record<string, unknown>,
    encoding: Record<string, Encoding> = {},
  ): URLSearchParams {
    return requestBodyToUrlSearchParams(obj, encoding)
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
  ): [string, string | number | boolean | undefined | null][] {
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
