import type {RouterMiddleware} from "@koa/router"
import {
  createRouter,
  type RouteMatchingGetByFixedField,
  type RouteMatchingGetById,
} from "../../generated/server/koa/routes/route-matching.ts"

export const routerMatchingLoggingMiddleware: RouterMiddleware = async (
  ctx,
  next,
) => {
  console.log(`Request started: ${ctx.method} ${ctx.path}`)
  await next()
  console.log(
    `Request completed: [${ctx.status}] ${ctx.method} ${ctx.path} ${ctx.body}`,
  )
}

const routeMatchingGetByFixedField: RouteMatchingGetByFixedField = async (
  _params,
  respond,
) => {
  return respond.with200().body({matched: "fixed-field"})
}

const routeMatchingGetById: RouteMatchingGetById = async (
  {params},
  respond,
) => {
  return respond.with200().body({matched: "id", id: params.id})
}

export function createRouteMatchingRouter() {
  return createRouter(
    {
      routeMatchingGetByFixedField,
      routeMatchingGetById,
    },
    {middleware: [routerMatchingLoggingMiddleware]},
  )
}
