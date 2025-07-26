import qs from "qs"
import {
  type Encoding,
  requestBodyToUrlSearchParams,
} from "./request-bodies/url-search-params"
import type {
  AbstractFetchClientConfig,
  HeaderParams,
  HeadersInit,
  QueryParams,
  Res,
  StatusCode,
} from "./types"

export * from "./types"

export abstract class AbstractFetchClient {
  protected readonly basePath: string
  protected readonly defaultHeaders: Record<string, string>
  protected readonly defaultTimeout: number | undefined

  protected constructor(config: AbstractFetchClientConfig) {
    this.basePath = config.basePath
    this.defaultHeaders = config.defaultHeaders ?? {}
    this.defaultTimeout = config.defaultTimeout
  }

  protected async _fetch<R extends Res<StatusCode, unknown>>(
    url: string,
    opts: RequestInit,
    timeout: number | undefined = this.defaultTimeout,
  ): Promise<R> {
    // main abort controller that will be returned to the caller
    const cancelRequest = new AbortController()

    // if a timeout is provided, set a timeout signal and connect to main abort controller
    if (timeout && timeout > 0) {
      const timeoutSignal = AbortSignal.timeout(timeout)
      timeoutSignal.addEventListener("abort", () => {
        cancelRequest.abort(timeoutSignal.reason)
      })
    }

    // if we were provided a signal connect it to the main abort controller
    const userSignal = opts.signal

    if (userSignal) {
      userSignal.addEventListener("abort", () =>
        cancelRequest.abort(userSignal.reason),
      )
    }

    const headers = opts.headers ?? this._headers()

    return fetch(url, {
      ...opts,
      headers,
      signal: cancelRequest.signal,
    }).catch((err) => {
      // workaround bug where eg: TimeoutError gets converted to an AbortError
      // https://stackoverflow.com/a/75973817/1445636
      if (err?.name === "AbortError") {
        cancelRequest.signal.throwIfAborted()
      }
      // if not aborted just throw
      throw err
    }) as unknown as R
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
    optsHeaders: HeadersInit = {},
  ): Headers {
    const headers = new Headers()

    /*
    This is pretty hideous, but basically we:
    - Maintain a set of deleted headers, the nullSet
    - Apply headers from most specific, to least
    - Delete headers if we encounter a null value and note this in the nullSet

    The primary reason is to enable the use of headers.append to support setting
    the same header multiple times (aka `Set-Cookie`), whilst *also* allowing more
    specific header sources to override all instances of the less specific source.
     */

    const nullSet = new Set<string>()

    this.setHeaders(headers, optsHeaders, nullSet)
    this.setHeaders(headers, paramHeaders, nullSet)
    this.setHeaders(headers, this.defaultHeaders, nullSet)

    return headers
  }

  protected _requestBodyToUrlSearchParams(
    obj: Record<string, unknown>,
    encoding: Record<string, Encoding> = {},
  ): URLSearchParams {
    return requestBodyToUrlSearchParams(obj, encoding)
  }

  private setHeaders(
    headers: Headers,
    headersInit: HeaderParams | HeadersInit,
    nullSet: Set<string>,
  ) {
    const headersArray = this.headersAsArray(headersInit)

    const filteredHeadersArray = headersArray.filter(
      ([headerName, headerValue]) =>
        !headers.has(headerName) &&
        headerValue !== undefined &&
        !nullSet.has(headerName),
    )

    for (const [headerName, headerValue] of filteredHeadersArray) {
      if (headerValue === null) {
        headers.delete(headerName)
        nullSet.add(headerName)
      } else if (headerValue !== undefined) {
        headers.append(headerName, headerValue.toString())
      }
    }
  }

  private headersAsArray(
    headers: HeaderParams | HeadersInit,
  ): [string, string | number | boolean | undefined | null][] {
    if (isMultiDimArray(headers)) {
      return headers.flatMap((it) =>
        isNonEmptyArray(it) ? headerArrayToTuples(it) : [],
      )
    }

    if (headers instanceof Headers) {
      const result: [string, string][] = []
      headers.forEach((value, key) => {
        result.push([key, value])
      })
      return result
    }

    if (headers && typeof headers === "object") {
      const result: [string, string][] = []

      for (const [headerName, values] of Object.entries(headers)) {
        if (Array.isArray(values)) {
          for (const value of values) {
            result.push([headerName, value])
          }
        } else {
          result.push([headerName, values])
        }
      }

      return result
    }

    throw new Error(`couldn't process headers '${headers}'`)
  }
}

function isMultiDimArray<T>(arr: unknown): arr is T[][] {
  return Array.isArray(arr) && Array.isArray(arr[0])
}

type NonEmptyArray<T> = [T, ...T[]]

function isNonEmptyArray<T>(it: T[]): it is NonEmptyArray<T> {
  return Array.isArray(it) && it.length > 0
}

function headerArrayToTuples<
  T extends string | number | boolean | undefined | null,
>([head, ...rest]: [string, ...T[]]): [string, T][] {
  return rest.map((value) => [head, value] as const)
}
