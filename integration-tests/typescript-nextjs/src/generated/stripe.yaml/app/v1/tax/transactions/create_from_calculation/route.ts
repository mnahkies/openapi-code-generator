import { _POST } from "../../../../../generated/v1/tax/transactions/create_from_calculation/route"

export const POST = _POST(async ({ body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
