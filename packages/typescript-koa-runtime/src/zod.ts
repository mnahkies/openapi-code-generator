import type { ZodSchema } from "zod"
import type { Context, Middleware, Next } from "koa"

export function paramValidationFactory<Type>(schema: ZodSchema): Middleware<{ params: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.safeParse(ctx.params)

    if (!result.success) {
      throw new Error("validation error")
    }

    ctx.state.params = result.data

    return next()
  }
}

export function queryValidationFactory<Type>(schema: ZodSchema): Middleware<{ query: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.safeParse(ctx.query)

    if (!result.success) {
      throw new Error("validation error")
    }

    ctx.state.query = result.data

    return next()
  }
}

export function bodyValidationFactory<Type>(schema: ZodSchema): Middleware<{ body: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.safeParse(ctx.request.body)

    if (!result.success) {
      throw new Error("validation error")
    }

    ctx.state.body = result.data

    return next()
  }
}
