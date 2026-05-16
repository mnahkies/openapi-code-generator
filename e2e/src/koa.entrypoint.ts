import Router from "@koa/router"
import {bootstrap} from "./generated/server/koa/index.ts"
import {createEscapeHatchesRouter} from "./routes/koa/escape-hatches.ts"
import {createMediaTypesRouter} from "./routes/koa/media-types.ts"
import {createQueryParametersRouter} from "./routes/koa/query-parameters.ts"
import {createRequestHeadersRouter} from "./routes/koa/request-headers.ts"
import {createRouteMatchingRouter} from "./routes/koa/route-matching.ts"
import {createTimeoutRouter} from "./routes/koa/timeout.ts"
import {createValidationRouter} from "./routes/koa/validation.ts"
import {createErrorResponse} from "./shared.ts"

function createRouter() {
  const router = new Router()

  const requestHeadersRouter = createRequestHeadersRouter()
  const validationRouter = createValidationRouter()
  const escapeHatchesRouter = createEscapeHatchesRouter()
  const mediaTypesRouter = createMediaTypesRouter()
  const queryParametersRouter = createQueryParametersRouter()
  const routeMatchingRouter = createRouteMatchingRouter()
  const timeoutRouter = createTimeoutRouter()

  router.use(
    requestHeadersRouter.routes(),
    requestHeadersRouter.allowedMethods(),
  )
  router.use(validationRouter.routes(), validationRouter.allowedMethods())
  router.use(escapeHatchesRouter.routes(), escapeHatchesRouter.allowedMethods())
  router.use(mediaTypesRouter.routes(), mediaTypesRouter.allowedMethods())
  router.use(
    queryParametersRouter.routes(),
    queryParametersRouter.allowedMethods(),
  )
  router.use(routeMatchingRouter.routes(), routeMatchingRouter.allowedMethods())
  router.use(timeoutRouter.routes(), timeoutRouter.allowedMethods())

  return router
}

export async function startKoaServer() {
  return await bootstrap({
    cors: {
      credentials: true,
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["GET", "OPTIONS"],
      origin: "http://example.com",
    },
    middleware: [
      async function errorHandler(ctx, next) {
        try {
          await next()
        } catch (err) {
          const {status, body} = createErrorResponse(err)
          ctx.status = status
          ctx.body = body
        }
      },
      async function notFoundHandler(ctx, next) {
        await next()
        if (ctx.body || ctx.status !== 404) {
          return
        }
        ctx.status = 404
        ctx.body = {code: 404, message: "route not found"}
      },
    ],
    router: createRouter(),
  })
}

if (require.main === module) {
  startKoaServer().catch((err) => {
    console.error("fatal error", err)
    process.exit(1)
  })
}
