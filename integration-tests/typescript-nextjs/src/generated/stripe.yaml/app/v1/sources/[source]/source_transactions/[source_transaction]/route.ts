import { _GET } from "../../../../../../generated/v1/sources/[source]/source_transactions/[source_transaction]/route"

export const GET = _GET(async ({ params, query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
