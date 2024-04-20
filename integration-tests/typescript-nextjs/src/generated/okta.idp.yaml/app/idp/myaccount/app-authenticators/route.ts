import { _POST } from "../../../../generated/idp/myaccount/app-authenticators/route"

export const POST = _POST(async ({ body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
