import Router from "@koa/router"
import {bootstrap} from "./generated/server/koa"
import {createEscapeHatchesRouter} from "./routes/koa/escape-hatches"
import {createMediaTypesRouter} from "./routes/koa/media-types"
import {createRequestHeadersRouter} from "./routes/koa/request-headers"
import {createValidationRouter} from "./routes/koa/validation"
import {createErrorResponse} from "./shared"

function createRouter() {
  const router = new Router()

  const requestHeadersRouter = createRequestHeadersRouter()
  const validationRouter = createValidationRouter()
  const escapeHatchesRouter = createEscapeHatchesRouter()
  const mediaTypesRouter = createMediaTypesRouter()

  router.use(
    requestHeadersRouter.allowedMethods(),
    requestHeadersRouter.routes(),
  )
  router.use(validationRouter.allowedMethods(), validationRouter.routes())
  router.use(escapeHatchesRouter.allowedMethods(), escapeHatchesRouter.routes())
  router.use(mediaTypesRouter.allowedMethods(), mediaTypesRouter.routes())

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
