import {
  _DELETE,
  _GET,
} from "../../../../../../../generated/v1/customers/[customer]/subscriptions/[subscription_exposed_id]/discount/route"

export const DELETE = _DELETE(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const GET = _GET(async ({ params, query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
