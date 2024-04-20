import {
  _OPTIONS,
  _POST,
} from "../../../../../../generated/okta.oauth.yaml/oauth2/[authorizationServerId]/v1/par/route"

export const OPTIONS = _OPTIONS(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const POST = _POST(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
