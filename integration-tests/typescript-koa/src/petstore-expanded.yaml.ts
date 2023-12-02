/**
 * @prettier
 */
import {
  bootstrap,
  createRouter,
  FindPetById,
} from "./generated/petstore-expanded.yaml/generated"

import {Context, Next} from "koa"
import {KoaRuntimeError} from "@nahkies/typescript-koa-runtime/errors"
import {ZodError} from "zod"
import {t_Error} from "./generated/petstore-expanded.yaml/models"

const notImplemented = async () => {
  return {
    status: 501 as const,
    body: {code: 1, message: "not implemented"},
  }
}

const findPetById: FindPetById = async ({params}, ctx) => {
  switch (params.id) {
    case 1:
      return {
        status: 200 as const,
        body: {
          id: 1,
          name: "Jake",
          breed: "border-collie",
        },
      }

    case 2:
      return {
        status: 200 as const,
        body: {
          id: 2,
          name: "Lacy",
          breed: "border-collie",
        },
      }

    default:
      return {
        status: 404 as const,
        body: {
          code: 2,
          message: "not found",
        },
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
