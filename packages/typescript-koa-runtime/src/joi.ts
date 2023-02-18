import type {Schema} from "@hapi/joi"
import type { Context, Middleware, Next } from "koa"
import type koaBody from "koa-body"

export function paramValidationFactory<Type>(schema: Schema): Middleware<{ params: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.params, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.state.params = result.value

    return next()
  }
}

export function queryValidationFactory<Type>(schema: Schema): Middleware<{ query: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.query, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.state.query = result.value

    return next()
  }
}

export function bodyValidationFactory<Type>(schema: Schema): Middleware<{ body: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.request.body, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.state.body = result.value

    return next()
  }
}
