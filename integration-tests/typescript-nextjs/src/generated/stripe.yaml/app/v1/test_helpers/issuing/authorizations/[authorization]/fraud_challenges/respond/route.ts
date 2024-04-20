import { _POST } from "../../../../../../../../generated/v1/test_helpers/issuing/authorizations/[authorization]/fraud_challenges/respond/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
