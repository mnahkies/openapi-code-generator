import {type NextFunction, type Request, type Response, Router} from "express"
import {bootstrap} from "./generated/server/express"
import {createEscapeHatchesRouter} from "./routes/express/escape-hatches"
import {createRequestHeadersRouter} from "./routes/express/request-headers"
import {createValidationRouter} from "./routes/express/validation"
import {createErrorResponse} from "./shared"

function createRouter() {
  const router = Router()

  const requestHeadersRouter = createRequestHeadersRouter()
  const validationRouter = createValidationRouter()
  const escapeHatchesRouter = createEscapeHatchesRouter()

  router.use(requestHeadersRouter)
  router.use(validationRouter)
  router.use(escapeHatchesRouter)

  return router
}

export async function startExpressServer() {
  const {app, server, address} = await bootstrap({
    cors: {
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type"],
      methods: ["GET", "OPTIONS"],
      origin: "http://example.com",
    },
    router: createRouter(),
    notFoundHandler: (req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({code: 404, message: "route not found"})
    },
    errorHandler: (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (res.headersSent) {
        return next(err)
      }

      const {status, body} = createErrorResponse(err)
      res.status(status).json(body)
    },
  })

  return {app, server, address}
}

if (require.main === module) {
  startExpressServer().catch((err) => {
    console.error("fatal error", err)
    process.exit(1)
  })
}
