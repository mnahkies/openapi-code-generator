import cors from "@koa/cors"
import Koa, {Middleware} from "koa"
import koaBody from "koa-body"
import Router from "@koa/router"
import {Server} from "http"

export type ServerConfig = {
  middleware?: Middleware[]
  router: Router
  port: number
}

export function startServer(config: ServerConfig): Server {
  const app = new Koa()

  app.use(cors())
  app.use(koaBody())

  const middleware = config.middleware ?? []
  middleware.forEach(it => app.use(it))

  app.use(config.router.allowedMethods())
  app.use(config.router.routes())

  const server = app.listen(config.port, () => {
    const address = server.address()
    console.info("server listening", {address})
  })

  return server
}
