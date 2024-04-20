import { _POST } from "../../../../../../generated/stripe.yaml/v1/payment_method_domains/[payment_method_domain]/validate/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
