import { _GET } from "../../../../../generated/v1/credit_notes/[credit_note]/lines/route"

export const GET = _GET(async ({ params, query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
