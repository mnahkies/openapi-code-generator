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
      ctx.status = KoaRuntimeError.isKoaError(err) ? 400 : 500
      ctx.body =
        err instanceof Error
          ? {
              message: err.message,
              phase: KoaRuntimeError.isKoaError(err) ? err.phase : undefined,
              cause:
                err.cause instanceof Error
                  ? {
                      message: err.cause.message,
                    }
                  : undefined,
            }
          : {message: "non error thrown", value: err}
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
