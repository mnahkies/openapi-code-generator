export enum RequestInputType {
  RouteParam = "route params",
  QueryString = "querystring",
  RequestBody = "request body",
  RequestHeader = "request header",
}

export abstract class AbstractRuntimeError extends Error {
  protected constructor(
    message: string,
    cause: unknown,
    public readonly phase:
      | "request_validation"
      | "request_handler"
      | "response_validation",
  ) {
    super(message, {cause})
  }
}
