import {
  type GetHeadersRequest,
  type GetHeadersUndeclared,
  createRouter,
} from "../generated/routes/headers"

const getHeadersUndeclared: GetHeadersUndeclared = async (
  {headers},
  respond,
  ctx,
) => {
  return (
    respond
      .with200()
      // biome-ignore lint/suspicious/noExplicitAny: passing through headers to prove none were parsed
      .body({typedHeaders: headers as unknown as any, rawHeaders: ctx.headers})
  )
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

export function createHeadersRouter() {
  return createRouter({
    getHeadersUndeclared,
    getHeadersRequest,
  })
}
