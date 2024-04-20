import { _GET } from "../../../../../generated/idp/myaccount/profile/schema/route"

export const GET = _GET(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
