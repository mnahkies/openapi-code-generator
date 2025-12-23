// from https://stackoverflow.com/questions/39494689/is-it-possible-to-restrict-number-to-a-certain-range
import {OpenAPIRuntimeError} from "./errors"

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

export type StatusCode1xx = IntRange<100, 199> // `1${number}${number}`
export type StatusCode2xx = IntRange<200, 299> // `2${number}${number}`
export type StatusCode3xx = IntRange<300, 399> // `3${number}${number}`
export type StatusCode4xx = IntRange<400, 499> // `4${number}${number}`
export type StatusCode5xx = IntRange<500, 599> // `5${number}${number}`
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

export class OpenAPIRuntimeResponse<Type> {
  private _body?: Type

  constructor(private readonly status: StatusCode) {}

  body(body: Type): this {
    this._body = body
    return this
  }

  unpack(): Res<StatusCode, Type | undefined> {
    return {status: this.status, body: this._body}
  }

  static unwrap(it: OpenAPIRuntimeResponse<unknown> | Response): Response {
    if (it instanceof Response) {
      return it
    }
    const {status, body} = it.unpack()

    return body !== undefined
      ? Response.json(body, {status})
      : new Response(undefined, {status})
  }
}

export type OpenAPIRuntimeResponder<
  Status extends StatusCode = StatusCode,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  Type = any,
> = {
  withStatus: (status: Status) => OpenAPIRuntimeResponse<Type>
}

export type Params<Params, Query, Body, Header> = {
  params: Params
  query: Query
  body: Body
  headers: Header
}
