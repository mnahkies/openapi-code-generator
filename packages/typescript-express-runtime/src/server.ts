import type {Server} from "node:http"
import type {ListenOptions} from "node:net"
import type {AddressInfo} from "node:net"

import type {OptionsJson} from "body-parser"
import Cors, {type CorsOptions, type CorsOptionsDelegate} from "cors"
import express, {type Express, type RequestHandler, type Router} from "express"

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

export class ExpressRuntimeResponse<Type> {
  private _body?: Type

  constructor(private readonly status: StatusCode) {}

  body(body: Type): this {
    this._body = body
    return this
  }

  unpack(): Response<StatusCode, Type | undefined> {
    return {status: this.status, body: this._body}
  }
}

export type ExpressRuntimeResponder<
  Status extends StatusCode = StatusCode,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  Type = any,
> = {
  withStatus: (status: Status) => ExpressRuntimeResponse<Type>
}

export type ServerConfig = {
  /**
   * set to "disabled" to disable cors middleware, omit or pass undefined for defaults
   *
   * by default, all origins are allowed. you probably don't want this in production,
   * so it's strongly recommended to explicitly configure this.
   **/
  cors?: "disabled" | CorsOptions | CorsOptionsDelegate | undefined

  /**
   * set to "disabled" to disable body parsing middleware, omit or pass undefined for defaults.
   *
   * if disabling, ensure you pass a body parsing middleware that places the parsed
   * body on `req.body` for request body processing to work.
   **/
  body?: "disabled" | OptionsJson | undefined

  /**
   * provide arbitrary express middleware to be mounted before all request handlers
   * useful for mounting logging, error handlers, alternative body parsers, etc
   */
  middleware?: RequestHandler[]

  /**
   * the router to use, normally obtained by calling the generated `createRouter`
   * function
   */
  router: Router

  /**
   * the port to listen on, a randomly allocated port will be used if none passed
   * alternatively ListenOptions can be passed to control the network interface
   * bound to.
   */
  port?: number | ListenOptions
}

export type Params<Params, Query, Body, Header> = {
  params: Params
  query: Query
  body: Body
  headers: Header
}

/**
 * Starts an Express server and listens on `port` or a randomly allocated port if none provided.
 * Enables CORS and body parsing by default. It's recommended to customize the CORS options
 * for production usage.
 *
 * If you need more control over your Express server you should avoid calling this function,
 * and instead mount the router from your generated codes `createRouter` call directly
 * onto a server you have constructed.
 */
export async function startServer({
  middleware = [],
  cors = undefined,
  body = undefined,
  port = 0,
  router,
}: ServerConfig): Promise<{
  app: Express
  server: Server
  address: AddressInfo
}> {
  const app = express()

  if (cors !== "disabled") {
    app.use(Cors(cors))
    app.options("*route", Cors(cors))
  }

  if (body !== "disabled") {
    app.use(express.json(body))
  }

  if (middleware) {
    for (const it of middleware) {
      app.use(it)
    }
  }

  app.use(router)

  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(port)

      server.once("listening", () => {
        try {
          const address = server.address()

          if (!address || typeof address !== "object") {
            throw new Error("failed to bind port")
          }

          resolve({app, server, address})
        } catch (err) {
          reject(err)
        }
      })

      server.once("error", (err) => {
        reject(err)
      })
    } catch (err) {
      reject(err)
    }
  })
}
