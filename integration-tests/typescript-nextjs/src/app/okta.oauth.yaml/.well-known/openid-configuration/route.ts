import { _GET } from "../../../../generated/okta.oauth.yaml/.well-known/openid-configuration/route"

export const GET = _GET(async ({ query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
