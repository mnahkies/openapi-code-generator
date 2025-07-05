export enum RequestInputType {
  RouteParam = "route params",
  QueryString = "querystring",
  RequestBody = "request body",
  RequestHeader = "request header",
}

export class OpenAPIRuntimeError extends Error {
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
  ): OpenAPIRuntimeError {
    return new OpenAPIRuntimeError(
      `Request validation failed parsing ${inputType}`,
      cause,
      "request_validation",
    )
  }

  static HandlerError(cause: unknown) {
    return new OpenAPIRuntimeError(
      "Request handler threw unhandled exception",
      cause,
      "request_handler",
    )
  }

  static ResponseError(cause: unknown) {
    return new OpenAPIRuntimeError(
      "Response body failed validation",
      cause,
      "response_validation",
    )
  }

  static isOpenAPIError(err: unknown): err is OpenAPIRuntimeError {
    return err instanceof OpenAPIRuntimeError
  }
}
