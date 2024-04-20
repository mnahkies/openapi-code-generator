import {_GET} from "../../../../../../generated/stripe.yaml/v1/payment_links/[payment_link]/line_items/route"

export const GET = _GET(async ({params, query, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
