import { _GET } from "../../../../../generated/okta.idp.yaml/idp/myaccount/okta-applications/route"

export const GET = _GET(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
