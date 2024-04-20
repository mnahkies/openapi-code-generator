import { _GET } from "../../../../../../generated/orgs/[org]/teams/[team_slug]/teams/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
