import {type GetHeadersRequest, createRouter} from "../generated/routes/headers"

const getHeadersRequest: GetHeadersRequest = async (_, respond, ctx) => {
  return respond.with200().body({headers: ctx.headers})
}

export function createHeadersRouter() {
  return createRouter({
    getHeadersUndeclared: getHeadersRequest,
    getHeadersRequest,
  })
}
