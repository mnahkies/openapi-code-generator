import type {Res, StatusCode} from "@nahkies/typescript-common-runtime/types"

export type {
  Params,
  Res,
  StatusCode,
  StatusCode1xx,
  StatusCode2xx,
  StatusCode3xx,
  StatusCode4xx,
  StatusCode5xx,
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
