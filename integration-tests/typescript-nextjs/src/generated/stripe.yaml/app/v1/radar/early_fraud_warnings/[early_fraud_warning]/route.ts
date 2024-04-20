import { _GET } from "../../../../../generated/v1/radar/early_fraud_warnings/[early_fraud_warning]/route"

export const GET = _GET(async ({ params, query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
