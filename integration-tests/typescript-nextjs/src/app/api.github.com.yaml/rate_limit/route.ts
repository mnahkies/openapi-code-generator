import { _GET } from "../../../generated/api.github.com.yaml/rate_limit/route"

export const GET = _GET(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
