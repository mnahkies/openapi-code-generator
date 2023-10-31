/**
 * @prettier
 */

import Cors from "@koa/cors"
import Koa, {Middleware} from "koa"
import KoaBody from "koa-body"
import Router from "@koa/router"
import {Server} from "http"
import {KoaBodyMiddlewareOptions} from "koa-body/lib/types"
import {AddressInfo} from "node:net"

// from https://stackoverflow.com/questions/39494689/is-it-possible-to-restrict-number-to-a-certain-range
type Enumerate<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>

type IntRange<F extends number, T extends number> = F extends T
  ? F
  : Exclude<Enumerate<T>, Enumerate<F>> extends never
  ? never
  : Exclude<Enumerate<T>, Enumerate<F>> | T

export type StatusCode1xx = IntRange<100, 199> // `1${number}${number}`
export type StatusCode2xx = IntRange<200, 299> // `2${number}${number}`
export type StatusCode3xx = IntRange<300, 399> // `3${number}${number}`
export type StatusCode4xx = IntRange<400, 499> // `4${number}${number}`
export type StatusCode5xx = IntRange<500, 599> // `5${number}${number}`
export type StatusCode =
  | StatusCode1xx
  | StatusCode2xx
  | StatusCode3xx
  | StatusCode4xx
  | StatusCode5xx

export type Response<Status extends StatusCode, Type> = {
  status: Status
  body: Type
}

export type ServerConfig = {
  /** set to false to disable cors middleware, pass undefined for defaults */
  cors?: false | Cors.Options | undefined

  /**
   * set to false to disable body parsing middleware, pass undefined for defaults.
   *
   * if disabling, ensure you pass a body parsing middlware that places the parsed
   * body on `ctx.body` for request body processing to work.
   **/
  body?: false | KoaBodyMiddlewareOptions | undefined

  /**
   * optional array of arbitrary middleware to be mounted before the Router,
   * useful for mounting logging, alternative body parsers, etc
   */
  middleware?: Middleware[]

  /**
   * the router to use, normally obtained by calling the generated `createRouter`
   * function
   */
  router: Router

  /**
   * the port to listen on, a randomly allocated port will be used if none passed
   */
  port?: number
}

export async function startServer({
  middleware = [],
  cors = undefined,
  body = undefined,
  port = 0,
  router,
}: ServerConfig): Promise<{
  app: Koa
  server: Server
  address: AddressInfo
}> {
  const app = new Koa()

  if (cors !== false) {
    app.use(Cors(cors))
  }

  if (body !== false) {
    app.use(KoaBody(body))
  }

  middleware.forEach((it) => app.use(it))

  app.use(router.allowedMethods())
  app.use(router.routes())

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      const address = server.address()

      if (!address || typeof address !== "object") {
        throw new Error("failed to bind port")
      }

      console.info("server listening", {address})

      resolve({app, server, address})
    })
  })
}
