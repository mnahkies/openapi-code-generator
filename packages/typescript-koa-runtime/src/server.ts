import type {Server} from "node:http"
import type {ListenOptions} from "node:net"
import type {AddressInfo} from "node:net"
import Cors from "@koa/cors"
import type Router from "@koa/router"
import Koa, {type Middleware} from "koa"
import KoaBody from "koa-body"
import type {KoaBodyMiddlewareOptions} from "koa-body/lib/types"
import {responseValidationFactory} from "./zod"

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

export class KoaRuntimeResponse<Type> {
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

export type ResponderBuilder = {
  [key in `with${StatusCode}`]: <T, S = unknown>(
    s: S,
  ) => () => KoaRuntimeResponse<T>
} & {
  withStatus(status: StatusCode): KoaRuntimeResponse<unknown>
  withStatusCode1xx<T, S = unknown>(
    s: S,
  ): (status: StatusCode1xx) => KoaRuntimeResponse<T>
  withStatusCode2xx<T, S = unknown>(
    s: S,
  ): (status: StatusCode2xx) => KoaRuntimeResponse<T>
  withStatusCode3xx<T, S = unknown>(
    s: S,
  ): (status: StatusCode3xx) => KoaRuntimeResponse<T>
  withStatusCode4xx<T, S = unknown>(
    s: S,
  ): (status: StatusCode4xx) => KoaRuntimeResponse<T>
  withStatusCode5xx<T, S = unknown>(
    s: S,
  ): (status: StatusCode5xx) => KoaRuntimeResponse<T>
  withDefault<T, S = unknown>(
    s: S,
  ): (status: StatusCode) => KoaRuntimeResponse<T>
}

function isValidStatusCode(status: unknown): status is StatusCode {
  if (typeof status !== "number") {
    return false
  }
  return !(status < 100 || status > 599)
}

export const b = <T>(fn: (r: ResponderBuilder) => T & KoaRuntimeResponder) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const responses: any[] = []
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let defaultResponse: any = undefined

  const r: ResponderBuilder = new Proxy({} as ResponderBuilder, {
    get(_, prop: string) {
      const exactMatch = /^with(\d{3})$/.exec(prop)

      if (exactMatch?.[1]) {
        const status = Number(exactMatch[1])

        if (!isValidStatusCode(status)) {
          throw new Error(`Status ${status} is not a valid status code`)
        }

        return <S>(s: S) => {
          responses.push([status.toString(), s])

          return <T>() => new KoaRuntimeResponse<T>(status)
        }
      }

      const groupMatch = /^withStatusCode([1-5]xx)$/.exec(prop)
      if (groupMatch?.[1]) {
        const range = groupMatch[1]

        return <S>(s: S) => {
          responses.push([range, s])

          return <T>(status: StatusCode) => {
            const expectedHundreds = Number(range[0])
            if (Math.floor(status / 100) !== expectedHundreds) {
              throw new Error(
                `Status ${status} is not a valid ${range} status code`,
              )
            }
            return new KoaRuntimeResponse<T>(status)
          }
        }
      }

      if (prop === "withDefault") {
        return <S>(s: S) => {
          defaultResponse = s

          return <T>(status: StatusCode) => new KoaRuntimeResponse<T>(status)
        }
      }

      if (prop === "withStatus") {
        return (status: StatusCode) => new KoaRuntimeResponse<unknown>(status)
      }

      throw new Error(`Unknown responder method: ${prop}`)
    },
  })

  const responder = fn(r)

  return {
    responder,
    validator: responseValidationFactory(responses, defaultResponse),
  }
}

export const r: ResponderBuilder = new Proxy({} as ResponderBuilder, {
  get(_, prop: string) {
    const exactMatch = /^with(\d{3})$/.exec(prop)

    if (exactMatch?.[1]) {
      const status = Number(exactMatch[1])

      if (!isValidStatusCode(status)) {
        throw new Error(`Status ${status} is not a valid status code`)
      }

      return <T>() => new KoaRuntimeResponse<T>(status)
    }

    const groupMatch = /^withStatusCode([1-5]xx)$/.exec(prop)
    if (groupMatch?.[1]) {
      const range = groupMatch[1]

      return <T>(status: StatusCode) => {
        const expectedHundreds = Number(range[0])
        if (Math.floor(status / 100) !== expectedHundreds) {
          throw new Error(
            `Status ${status} is not a valid ${range} status code`,
          )
        }
        return new KoaRuntimeResponse<T>(status)
      }
    }

    if (prop === "withDefault") {
      return <T>(status: StatusCode) => new KoaRuntimeResponse<T>(status)
    }

    if (prop === "withStatus") {
      return (status: StatusCode) => new KoaRuntimeResponse<unknown>(status)
    }

    throw new Error(`Unknown responder method: ${prop}`)
  },
})

export type KoaRuntimeResponder<
  Status extends StatusCode = StatusCode,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  Type = any,
> = {
  withStatus: (status: Status) => KoaRuntimeResponse<Type>
}

export type ServerConfig = {
  /** set to "disabled" to disable cors middleware, omit or pass undefined for defaults */
  cors?: "disabled" | Cors.Options | undefined

  /**
   * set to "disabled" to disable body parsing middleware, omit or pass undefined for defaults.
   *
   * if disabling, ensure you pass a body parsing middlware that places the parsed
   * body on `ctx.body` for request body processing to work.
   **/
  body?: "disabled" | KoaBodyMiddlewareOptions | undefined

  /**
   *
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
 * Starts a Koa server and listens on `port` or a randomly allocated port if none provided.
 * Enables CORS and body parsing by default. It's recommended to customize the CORS options
 * for production usage.
 *
 * If you need more control over your Koa server you should avoid calling this function,
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
  app: Koa
  server: Server
  address: AddressInfo
}> {
  const app = new Koa()

  if (cors !== "disabled") {
    app.use(Cors(cors))
  }

  if (body !== "disabled") {
    app.use(KoaBody(body))
  }

  // biome-ignore lint/complexity/noForEach: <explanation>
  middleware.forEach((it) => app.use(it))

  app.use(router.allowedMethods())
  app.use(router.routes())

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
