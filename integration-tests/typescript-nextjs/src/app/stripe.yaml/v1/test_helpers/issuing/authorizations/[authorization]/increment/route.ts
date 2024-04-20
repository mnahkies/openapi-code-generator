import { _POST } from "../../../../../../../../generated/stripe.yaml/v1/test_helpers/issuing/authorizations/[authorization]/increment/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
