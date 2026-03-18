import {
  createRouter,
  type RouteMatchingGetByFixedField,
  type RouteMatchingGetById,
} from "../../generated/server/koa/routes/route-matching.ts"

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
  return createRouter({
    routeMatchingGetByFixedField,
    routeMatchingGetById,
  })
}
