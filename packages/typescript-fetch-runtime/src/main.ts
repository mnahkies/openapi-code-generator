import qs from "node:querystring"

// from https://stackoverflow.com/questions/39494689/is-it-possible-to-restrict-number-to-a-certain-range
type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>

type IntRange<F extends number, T extends number> = F extends T ?
  F :
  Exclude<Enumerate<T>, Enumerate<F>> extends never ?
    never :
    Exclude<Enumerate<T>, Enumerate<F>> | T

export type StatusCode1xx = IntRange<100, 199>
export type StatusCode2xx = IntRange<200, 299>
export type StatusCode3xx = IntRange<300, 399>
export type StatusCode4xx = IntRange<400, 499>
export type StatusCode5xx = IntRange<500, 599>
export type StatusCode = StatusCode1xx | StatusCode2xx | StatusCode3xx | StatusCode4xx | StatusCode5xx

export type Response<Status extends StatusCode, Type> = { status: Status, body: Type }

export interface AbstractFetchClientConfig {
  basePath: string
  defaultHeaders: Record<string, string>
}

export abstract class AbstractFetchClient {
  protected readonly basePath: string
  protected readonly defaultHeaders: Record<string, string>

  protected constructor(
    config: AbstractFetchClientConfig
  ) {
    this.basePath = config.basePath
    this.defaultHeaders = config.defaultHeaders
  }

  protected _query(params: Record<string, string | number | boolean | string[] | undefined | null>): string {
    const definedParams = Object.entries(params)
      .filter(([, v]) => v !== undefined)

    if (!definedParams.length) {
      return ""
    }

    return "?" + qs.stringify(Object.fromEntries(
      definedParams
    ))
  }

  protected _headers(headers: Record<string, string | undefined>): Record<string, string> {
    return Object.fromEntries(
      Object.entries({...this.defaultHeaders, ...headers})
        .filter((it): it is [string, string] => it[1] !== undefined)
    )
  }
}
