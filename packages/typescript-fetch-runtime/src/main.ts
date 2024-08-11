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

export type TypedFetchResponse<R extends Res<StatusCode, unknown>> = Promise<
  Omit<Response, "json" | "status"> & R
>

export interface AbstractFetchClientConfig {
  basePath: string
  defaultHeaders: Record<string, string>
  defaultTimeout?: number
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
  | Record<string, string | number | undefined>
  | [string, string | number | undefined][]
  | Headers

export abstract class AbstractFetchClient {
  protected readonly basePath: string
  protected readonly defaultHeaders: Record<string, string>
  protected readonly defaultTimeout: number | undefined

  protected constructor(config: AbstractFetchClientConfig) {
    this.basePath = config.basePath
    this.defaultHeaders = config.defaultHeaders
    this.defaultTimeout = config.defaultTimeout
  }

  protected async _fetch<R extends Res<StatusCode, unknown>>(
    url: string,
    opts: RequestInit,
    timeout: number | undefined = this.defaultTimeout,
  ): TypedFetchResponse<R> {
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
    }) as TypedFetchResponse<R>
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

  protected _headers(
    paramHeaders: HeaderParams = {},
    optsHeaders: HeaderParams = {},
  ): Headers {
    const headers = new Headers()

    this.setHeaders(headers, this.defaultHeaders)
    this.setHeaders(headers, paramHeaders)
    this.setHeaders(headers, optsHeaders)

    return headers
  }

  private setHeaders(headers: Headers, headersInit: HeaderParams) {
    const headersArray = this.headersAsArray(headersInit)

    for (const [headerName, headerValue] of headersArray) {
      if (headerValue === undefined) {
        headers.delete(headerName)
      } else {
        headers.set(headerName, headerValue.toString())
      }
    }
  }

  private headersAsArray(
    headers: HeaderParams,
  ): [string, string | number | undefined][] {
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
