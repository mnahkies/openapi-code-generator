import {
  createRouter,
  type GetHeadersRequest,
  type GetHeadersUndeclared,
} from "../../generated/server/express/routes/request-headers.ts"

const getHeadersUndeclared: GetHeadersUndeclared = async (
  {headers},
  respond,
  req,
) => {
  return respond
    .with200()
    .body({typedHeaders: headers as any, rawHeaders: req.headers})
}

const getHeadersRequest: GetHeadersRequest = async (
  {headers},
  respond,
  req,
) => {
  return respond
    .with200()
    .body({typedHeaders: headers, rawHeaders: req.headers})
}

export function createRequestHeadersRouter() {
  return createRouter({
    getHeadersUndeclared,
    getHeadersRequest,
  })
}
