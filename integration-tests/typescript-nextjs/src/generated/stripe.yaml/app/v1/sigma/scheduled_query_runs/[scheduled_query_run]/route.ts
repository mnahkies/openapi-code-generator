import { _GET } from "../../../../../generated/v1/sigma/scheduled_query_runs/[scheduled_query_run]/route"

export const GET = _GET(async ({ params, query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
