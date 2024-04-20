import {_POST} from "../../../../../generated/stripe.yaml/v1/billing/meter_event_adjustments/route"

export const POST = _POST(async ({body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
