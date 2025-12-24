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
  body: Type
}

export type Params<Params, Query, Body, Header> = {
  params: Params
  query: Query
  body: Body
  headers: Header
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
  | Record<string, string | number | boolean | undefined | null>
  | [string, string | number | boolean | undefined | null][]
  | Headers

export type Server<T> = string & {__server__: T}

export type NonEmptyArray<T> = [T, ...T[]]

export function isNonEmptyArray<T>(it: T[]): it is NonEmptyArray<T> {
  return Array.isArray(it) && it.length > 0
}
