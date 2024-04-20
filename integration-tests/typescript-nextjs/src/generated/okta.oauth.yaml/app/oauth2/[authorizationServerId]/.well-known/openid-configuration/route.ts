import { _GET } from "../../../../../generated/oauth2/[authorizationServerId]/.well-known/openid-configuration/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
