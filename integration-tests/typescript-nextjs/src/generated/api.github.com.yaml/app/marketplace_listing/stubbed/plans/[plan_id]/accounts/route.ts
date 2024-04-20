import { _GET } from "../../../../../../generated/marketplace_listing/stubbed/plans/[plan_id]/accounts/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
