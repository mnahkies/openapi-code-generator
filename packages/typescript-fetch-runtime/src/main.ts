/**
 * @prettier
 */

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

export interface AbstractFetchClientConfig {
  basePath: string
  defaultHeaders: Record<string, string>
  defaultTimeout?: number
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

export abstract class AbstractFetchClient {
  protected readonly basePath: string
  protected readonly defaultHeaders: Record<string, string>
  protected readonly defaultTimeout?: number

  protected constructor(config: AbstractFetchClientConfig) {
    this.basePath = config.basePath
    this.defaultHeaders = config.defaultHeaders
    this.defaultTimeout = config.defaultTimeout
  }

  protected _fetch<R extends Res<any, any>>(
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

    const headers = opts.headers ?? this._headers({})

    const res = fetch(url, {
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
    })

    // decorate the Promise with itself and the AbortController, this allows the
    // caller to choose between:
    // - await the Promise and ignore the AbortController
    // - destructure the Promise to get the Promise and the AbortController
    // @ts-ignore
    res.res = res
    // @ts-ignore
    res.cancelRequest = cancelRequest
    return res as any
  }

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
}
