import {_GET} from "../../../../../../generated/okta.oauth.yaml/oauth2/[authorizationServerId]/.well-known/oauth-authorization-server/route"

export const GET = _GET(async ({params, query}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
