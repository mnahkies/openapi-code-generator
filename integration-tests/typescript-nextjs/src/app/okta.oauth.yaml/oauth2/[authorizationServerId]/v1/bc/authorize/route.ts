import {_POST} from "../../../../../../../generated/okta.oauth.yaml/oauth2/[authorizationServerId]/v1/bc/authorize/route"

export const POST = _POST(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
