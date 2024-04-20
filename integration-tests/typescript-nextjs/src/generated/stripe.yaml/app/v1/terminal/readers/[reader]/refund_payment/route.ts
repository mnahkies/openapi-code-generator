import { _POST } from "../../../../../../generated/v1/terminal/readers/[reader]/refund_payment/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
