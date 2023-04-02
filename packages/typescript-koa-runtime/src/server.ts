import cors from "@koa/cors"
import Koa, {Middleware} from "koa"
import koaBody from "koa-body"
import Router from "@koa/router"
import {Server} from "http"

// from https://stackoverflow.com/questions/39494689/is-it-possible-to-restrict-number-to-a-certain-range
type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>

type IntRange<F extends number, T extends number> = F extends T ?
  F :
  Exclude<Enumerate<T>, Enumerate<F>> extends never ?
    never :
    Exclude<Enumerate<T>, Enumerate<F>> | T

export type StatusCode1xx = IntRange<100, 199> // `1${number}${number}`
export type StatusCode2xx = IntRange<200, 299> // `2${number}${number}`
export type StatusCode3xx = IntRange<300, 399> // `3${number}${number}`
export type StatusCode4xx = IntRange<400, 499> // `4${number}${number}`
export type StatusCode5xx = IntRange<500, 599> // `5${number}${number}`
export type StatusCode = StatusCode1xx | StatusCode2xx | StatusCode3xx | StatusCode4xx | StatusCode5xx

export type Response<Status extends StatusCode, Type> = { status: Status, body: Type }

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
