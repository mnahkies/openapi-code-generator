import {ExpressRuntimeError} from "@nahkies/typescript-express-runtime/errors"
import {type NextFunction, type Request, type Response, Router} from "express"
import {bootstrap} from "./generated/server/express"
import {createRequestHeadersRouter} from "./routes/express/request-headers"
import {createValidationRouter} from "./routes/express/validation"

function createRouter() {
  const router = Router()

  const requestHeadersRouter = createRequestHeadersRouter()
  const validationRouter = createValidationRouter()

  router.use(requestHeadersRouter)
  router.use(validationRouter)

  return router
}

export async function startExpressServer() {
  const {app, server, address} = await bootstrap({
    router: createRouter(),
  })

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err)
    }

    const status = ExpressRuntimeError.isExpressError(err) ? 400 : 500
    const body =
      err instanceof Error
        ? {
            message: err.message,
            phase: ExpressRuntimeError.isExpressError(err)
              ? err.phase
              : undefined,
            cause:
              err.cause instanceof Error
                ? {
                    message: err.cause.message,
                  }
                : undefined,
          }
        : {message: "non error thrown", value: err}

    res.status(status).json(body)
  })

  return {app, server, address}
}

if (require.main === module) {
  startExpressServer().catch((err) => {
    console.error("fatal error", err)
    process.exit(1)
  })
}
