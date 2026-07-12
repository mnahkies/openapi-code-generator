import {
  type Res,
  SkipResponse,
  type StatusCode,
} from "@nahkies/typescript-common-runtime/types"

export {
  type Params,
  type Res,
  SkipResponse,
  type StatusCode,
  type StatusCode1xx,
  type StatusCode2xx,
  type StatusCode3xx,
  type StatusCode4xx,
  type StatusCode5xx,
} from "@nahkies/typescript-common-runtime/types"

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
