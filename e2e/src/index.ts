import Router from "@koa/router"
import {KoaRuntimeError} from "@nahkies/typescript-koa-runtime/errors"
import {bootstrap} from "./generated"
import {createRequestHeadersRouter} from "./routes/request-headers"
import {createValidationRouter} from "./routes/validation"

function createRouter() {
  const router = new Router()

  router.use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      if (KoaRuntimeError.isKoaError(err)) {
        ctx.status = 400
        ctx.body = {
          message: err.message,
          cause: {
            message: err.message,
          },
        }
      } else {
        throw err
      }
    }
  })

  const requestHeadersRouter = createRequestHeadersRouter()
  const validationRouter = createValidationRouter()

  router.use(
    requestHeadersRouter.allowedMethods(),
    requestHeadersRouter.routes(),
  )
  router.use(validationRouter.allowedMethods(), validationRouter.routes())

  return router
}

export async function main() {
  return await bootstrap({
    router: createRouter(),
  })
}

if (require.main === module) {
  main().catch((err) => {
    console.error("fatal error", err)
    process.exit(1)
  })
}
