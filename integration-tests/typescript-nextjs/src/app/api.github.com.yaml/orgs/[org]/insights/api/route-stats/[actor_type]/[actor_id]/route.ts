import { _GET } from "../../../../../../../../../generated/api.github.com.yaml/orgs/[org]/insights/api/route-stats/[actor_type]/[actor_id]/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
