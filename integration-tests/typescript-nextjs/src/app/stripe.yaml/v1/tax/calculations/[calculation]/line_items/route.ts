import { _GET } from "../../../../../../../generated/stripe.yaml/v1/tax/calculations/[calculation]/line_items/route"

export const GET = _GET(async ({ params, query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
