import {
  _GET,
  _POST,
} from "../../../../../generated/okta.idp.yaml/idp/myaccount/phones/route"

export const GET = _GET(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const POST = _POST(async ({body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
