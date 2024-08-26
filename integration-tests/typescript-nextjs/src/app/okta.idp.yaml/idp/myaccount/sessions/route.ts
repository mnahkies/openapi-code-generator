import { _DELETE } from "../../../../../generated/okta.idp.yaml/idp/myaccount/sessions/route"

export const DELETE = _DELETE(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
