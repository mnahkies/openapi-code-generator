import {
  createRouter,
  FindPetById,
} from "./generated/petstore-expanded.yaml/generated"

import {Context, Next} from "koa"
import {KoaRuntimeError} from "@nahkies/typescript-koa-runtime/errors"
import {ZodError} from "zod"
import {KoaRuntimeResponder} from "@nahkies/typescript-koa-runtime/server"
import {t_Error} from "./generated/petstore-expanded.yaml/models"
import {bootstrap} from "./generated/petstore-expanded.yaml"

const notImplemented = async (
  _: unknown,
  respond: KoaRuntimeResponder<501, t_Error>,
) => {
  return respond.withStatus(501).body({code: 404, message: "not implemented"})
}

const findPetById: FindPetById = async ({params}, respond) => {
  switch (params.id) {
    case 1:
      return respond.with200().body({
        id: 1,
        name: "Jake",
      })

    case 2:
      return respond.with200().body({
        id: 2,
        name: "Lacy",
      })

    default:
      return {
        status: 404 as const,
        body: {code: 404, message: "test"},
      }
  }
}

export async function genericErrorMiddleware(ctx: Context, next: Next) {
  try {
    await next()
  } catch (err) {
    // if the request validation failed, return a 400 and include helpful
    // information about the problem
    if (KoaRuntimeError.isKoaError(err) && err.phase === "request_validation") {
      ctx.status = 400
      ctx.body = {
        message: "request validation failed",
        code: 400,
        // @ts-ignore - petstore example doesn't include metadata on it's errors
        meta: err.cause instanceof ZodError ? {issues: err.cause.issues} : {},
      } satisfies t_Error
      return
    }

    // return a 500 and omit information from the response otherwise
    console.error("internal server error", err)
    ctx.status = 500
    ctx.body = {
      message: "internal server error",
      code: 500,
    } satisfies t_Error
  }
}

async function main() {
  const {server, address} = await bootstrap({
    router: createRouter({
      findPets: notImplemented,
      findPetById,
      addPet: notImplemented,
      deletePet: notImplemented,
    }),
    middleware: [genericErrorMiddleware],
    port: {port: 3000, host: "127.0.0.1"},
  })

  console.info(`listening on ${address.address}:${address.port}`)

  process.on("SIGTERM", () => {
    console.info("sigterm received, closing server")
    server.close()
  })
}

if (require.main === module) {
  main().catch((err) => {
    console.error("unhandled exception", err)
    process.exit(1)
  })
}
