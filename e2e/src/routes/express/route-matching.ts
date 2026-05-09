import type {RequestHandler} from "express"
import {
  createRouter,
  type RouteMatchingGetByFixedField,
  type RouteMatchingGetById,
} from "../../generated/server/express/routes/route-matching.ts"

export const routerMatchingLoggingMiddleware: RequestHandler = (
  req,
  res,
  next,
) => {
  console.log(`Request started: ${req.method} ${req.path}`)
  res.on("finish", () => {
    console.log(
      `Request completed: [${res.statusCode}] ${req.method} ${req.path}`,
    )
  })
  next()
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
