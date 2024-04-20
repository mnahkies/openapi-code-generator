import {
  _OPTIONS,
  _POST,
} from "../../../../../generated/okta.oauth.yaml/oauth2/v1/par/route"

export const OPTIONS = _OPTIONS(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const POST = _POST(async ({body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
