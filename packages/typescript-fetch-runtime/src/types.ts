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

export interface Res<Status extends StatusCode, JsonBody> extends Response {
  status: Status
  json: () => Promise<JsonBody>
}

export type Server<T> = string & {__server__: T}

export interface AbstractFetchClientConfig {
  basePath: string
  defaultHeaders?: Record<string, string>
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
  | Record<string, string | number | undefined | null>
  | [string, string | number | undefined | null][]
  | Headers

// fetch HeadersInit type
export type HeadersInit =
  | string[][]
  | readonly (readonly [string, string])[]
  | Record<string, string | ReadonlyArray<string>>
  | Headers
