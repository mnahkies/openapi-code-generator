import { _POST } from "../../../../../../../generated/stripe.yaml/v1/billing/meters/[id]/deactivate/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
