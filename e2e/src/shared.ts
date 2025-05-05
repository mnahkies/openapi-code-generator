import {KoaRuntimeError} from "@nahkies/typescript-koa-runtime/errors"

export function createErrorResponse(err: unknown) {
  if (KoaRuntimeError.isKoaError(err) && err.phase !== "request_handler") {
    return {
      status: 400,
      body: {
        message: err.message,
        phase: err.phase,
        cause: err.cause instanceof Error ? err.cause.message : undefined,
      },
    }
  }

  if (err instanceof Error) {
    return {
      status: 500,
      body: {
        message: err.message,
        phase: Reflect.get(err, "phase"),
        cause: err.cause instanceof Error ? err.cause.message : undefined,
      },
    }
  }
  return {
    status: 500,
    body: {
      message: "non error thrown",
      value: err,
    },
  }
}
