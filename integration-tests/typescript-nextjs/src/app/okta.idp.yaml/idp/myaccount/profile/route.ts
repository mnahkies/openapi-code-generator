import {
  _GET,
  _PUT,
} from "../../../../../generated/okta.idp.yaml/idp/myaccount/profile/route"

export const GET = _GET(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const PUT = _PUT(async ({ body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
