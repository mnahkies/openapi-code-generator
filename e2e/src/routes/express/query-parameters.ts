import {
  createRouter,
  type GetParamsDefaultObjectQuery,
  type GetParamsMixedQuery,
  type GetParamsSimpleQuery,
  type GetParamsUnexplodedObjectQuery,
} from "../../generated/server/express/routes/query-parameters.ts"

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

const getParamsMixedQuery: GetParamsMixedQuery = async ({query}, respond) => {
  return respond.with200().body({
    statuses: query.statuses,
    author_ids: query.author_ids,
    limit: query.limit,
    "kebab-case": query["kebab-case"],
  })
}

export function createQueryParametersRouter() {
  return createRouter({
    getParamsSimpleQuery,
    getParamsDefaultObjectQuery,
    getParamsUnexplodedObjectQuery,
    getParamsMixedQuery,
  })
}
