import { _GET } from "../../../../../../generated/okta.idp.yaml/idp/myaccount/authenticators/[authenticatorId]/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
