import { _GET } from "../../../../../../generated/users/[username]/settings/billing/shared-storage/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
