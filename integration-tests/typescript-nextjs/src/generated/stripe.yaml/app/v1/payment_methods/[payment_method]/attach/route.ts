import { _POST } from "../../../../../generated/v1/payment_methods/[payment_method]/attach/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
