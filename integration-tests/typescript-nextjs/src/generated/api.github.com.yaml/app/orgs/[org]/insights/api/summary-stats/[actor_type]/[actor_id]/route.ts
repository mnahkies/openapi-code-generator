import { _GET } from "../../../../../../../../generated/orgs/[org]/insights/api/summary-stats/[actor_type]/[actor_id]/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
