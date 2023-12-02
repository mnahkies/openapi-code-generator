/**
 * @prettier
 */

export enum RequestInputType {
  RouteParam = "route params",
  QueryString = "querystring",
  RequestBody = "request body",
}

export class KoaRuntimeError extends Error {
  private constructor(
    message: string,
    cause: unknown,
    public readonly phase:
      | "request_validation"
      | "request_handler"
      | "response_validation",
  ) {
    super(message, {cause})
  }

  static RequestError(
    cause: unknown,
    inputType: RequestInputType,
  ): KoaRuntimeError {
    return new KoaRuntimeError(
      `Request validation failed parsing ${inputType}`,
      cause,
      "request_validation",
    )
  }

  static HandlerError(cause: unknown) {
    return new KoaRuntimeError(
      "Request handler threw unhandled exception",
      cause,
      "request_handler",
    )
  }

  static ResponseError(cause: unknown) {
    return new KoaRuntimeError(
      "Response body failed validation",
      cause,
      "response_validation",
    )
  }

  static isKoaError(err: unknown): err is KoaRuntimeError {
    return err instanceof KoaRuntimeError
  }
}
