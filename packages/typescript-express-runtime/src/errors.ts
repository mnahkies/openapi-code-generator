import {
  AbstractRuntimeError,
  RequestInputType,
} from "@nahkies/typescript-common-runtime/errors"

export {RequestInputType}

export class ExpressRuntimeError extends AbstractRuntimeError {
  private constructor(
    message: string,
    cause: unknown,
    phase: "request_validation" | "request_handler" | "response_validation",
  ) {
    super(message, cause, phase)
  }

  static RequestError(
    cause: unknown,
    inputType: RequestInputType,
  ): ExpressRuntimeError {
    return new ExpressRuntimeError(
      `Request validation failed parsing ${inputType}`,
      cause,
      "request_validation",
    )
  }

  static HandlerError(cause: unknown) {
    return new ExpressRuntimeError(
      "Request handler threw unhandled exception",
      cause,
      "request_handler",
    )
  }

  static ResponseError(cause: unknown) {
    return new ExpressRuntimeError(
      "Response body failed validation",
      cause,
      "response_validation",
    )
  }

  static isExpressError(err: unknown): err is ExpressRuntimeError {
    return err instanceof ExpressRuntimeError
  }
}
