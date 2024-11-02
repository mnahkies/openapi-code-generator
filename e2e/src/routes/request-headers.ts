import {
  type GetHeadersRequest,
  type GetHeadersUndeclared,
  createRouter,
} from "../generated/routes/request-headers"

const getHeadersUndeclared: GetHeadersUndeclared = async (
  {headers},
  respond,
  ctx,
) => {
  return respond
    .with200()
    .body({typedHeaders: headers, rawHeaders: ctx.headers})
}

const getHeadersRequest: GetHeadersRequest = async (
  {headers},
  respond,
  ctx,
) => {
  return respond
    .with200()
    .body({typedHeaders: headers, rawHeaders: ctx.headers})
}

export function createRequestHeadersRouter() {
  return createRouter({
    getHeadersUndeclared,
    getHeadersRequest,
  })
}
