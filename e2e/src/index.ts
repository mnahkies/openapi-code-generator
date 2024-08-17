import Router from "@koa/router"
import {bootstrap} from "./generated"
import {createHeadersRouter} from "./routes/headers"
import {createValidationRouter} from "./routes/validation"

function createRouter() {
  const router = new Router()

  const headersRouter = createHeadersRouter()
  const validationRouter = createValidationRouter()

  router.use(headersRouter.allowedMethods(), headersRouter.routes())
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
