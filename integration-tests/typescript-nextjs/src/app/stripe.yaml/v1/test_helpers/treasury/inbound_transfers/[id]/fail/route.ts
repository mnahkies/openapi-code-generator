import { _POST } from "../../../../../../../../generated/stripe.yaml/v1/test_helpers/treasury/inbound_transfers/[id]/fail/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
