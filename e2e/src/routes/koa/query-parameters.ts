import {
  createRouter,
  type GetParamsDefaultObjectQuery,
  type GetParamsSimpleQuery,
  type GetParamsUnexplodedObjectQuery,
} from "../../generated/server/koa/routes/query-parameters.ts"

const getParamsSimpleQuery: GetParamsSimpleQuery = async ({query}, respond) => {
  return respond.with200().body({
    orderBy: query.orderBy,
    limit: query.limit,
  })
}

const getParamsDefaultObjectQuery: GetParamsDefaultObjectQuery = async (
  {query},
  respond,
) => {
  return respond.with200().body({
    filter: query.filter,
  })
}

const getParamsUnexplodedObjectQuery: GetParamsUnexplodedObjectQuery = async (
  {query},
  respond,
) => {
  return respond.with200().body({
    filter: query.filter,
  })
}

export function createQueryParametersRouter() {
  return createRouter({
    getParamsSimpleQuery,
    getParamsDefaultObjectQuery,
    getParamsUnexplodedObjectQuery,
  })
}
