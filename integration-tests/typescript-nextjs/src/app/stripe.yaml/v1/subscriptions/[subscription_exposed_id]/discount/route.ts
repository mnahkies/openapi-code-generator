import {_DELETE} from "../../../../../../generated/stripe.yaml/v1/subscriptions/[subscription_exposed_id]/discount/route"

export const DELETE = _DELETE(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
