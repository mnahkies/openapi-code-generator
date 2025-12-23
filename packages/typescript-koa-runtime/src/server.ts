import type {Server} from "node:http"
import type {AddressInfo, ListenOptions} from "node:net"
import Cors from "@koa/cors"
import type Router from "@koa/router"
import {parseOctetStreamRequestBody} from "@nahkies/typescript-common-runtime/request-bodies"
import type {Res, StatusCode} from "@nahkies/typescript-common-runtime/types"
import {KoaRuntimeError} from "@nahkies/typescript-koa-runtime/errors"
import Koa, {type Context, type Middleware, type Next} from "koa"
import type {KoaBodyMiddlewareOptions} from "koa-body"
import KoaBody from "koa-body"

export {parseQueryParameters} from "@nahkies/typescript-common-runtime/query-parser"
export type {
  Params,
  Res,
  StatusCode,
  StatusCode1xx,
  StatusCode2xx,
  StatusCode3xx,
  StatusCode4xx,
  StatusCode5xx,
} from "@nahkies/typescript-common-runtime/types"

export const SkipResponse = Symbol("skip response processing")

export class KoaRuntimeResponse<Type> {
  private _body?: Type

  constructor(private readonly status: StatusCode) {}

  body(body: Type): this {
    this._body = body
    return this
  }

  unpack(): Res<StatusCode, Type | undefined> {
    return {status: this.status, body: this._body}
  }
}

export function handleResponse(
  ctx: Context,
  next: Next,
  validator: (status: number, value: unknown) => unknown,
) {
  return async (
    response:
      | KoaRuntimeResponse<unknown>
      | typeof SkipResponse
      | Res<StatusCode, unknown>,
  ): Promise<void> => {
    // escape hatch to allow responses to be sent by the implementation handler
    if (response === SkipResponse) {
      return
    }

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = validator(status, body)
    ctx.status = status

    return next()
  }
}

export function handleImplementationError(err: unknown): never {
  throw KoaRuntimeError.HandlerError(err)
}

export type KoaRuntimeResponder<
  Status extends StatusCode = StatusCode,
  // biome-ignore lint/suspicious/noExplicitAny: needed
  Type = any,
> = {
  withStatus: (status: Status) => KoaRuntimeResponse<Type>
}

export type ServerConfig = {
  /**
   * set to "disabled" to disable cors middleware, omit or pass undefined for defaults
   *
   * the default behavior is to allow all origins
   **/
  cors?: "disabled" | Cors.Options | undefined

  /**
   * set to "disabled" to disable body parsing middleware, omit or pass undefined for defaults.
   *
   * if disabling, ensure you pass a body parsing middleware that places the parsed
   * body on `ctx.body` for request body processing to work.
   **/
  body?: "disabled" | Partial<KoaBodyMiddlewareOptions> | undefined

  /**
   * allows you to provide arbitrary koa middleware
   * useful for mounting logging, error handlers, 404 handling, alternative body parsers, etc.
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

export async function parseOctetStream(
  ctx: Context,
): Promise<Blob | undefined> {
  const body = await parseOctetStreamRequestBody(ctx.req, {sizeLimit: "1mb"})
  ctx.body = body
  return body
}

/**
 * Starts a Koa server and listens on `port` or a randomly allocated port if none provided.
 * Enables CORS and body parsing by default. It's recommended to customize the CORS options
 * for production usage.
 *
 * If you need more control over your Koa server, you should avoid calling this function
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

  for (const it of middleware) {
    app.use(it)
  }

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
