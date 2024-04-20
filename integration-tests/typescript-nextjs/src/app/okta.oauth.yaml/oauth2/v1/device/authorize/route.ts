import {_POST} from "../../../../../../generated/okta.oauth.yaml/oauth2/v1/device/authorize/route"

export const POST = _POST(async ({body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
