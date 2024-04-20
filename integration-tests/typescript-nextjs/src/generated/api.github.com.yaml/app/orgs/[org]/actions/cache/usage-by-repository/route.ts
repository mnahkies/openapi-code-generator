import { _GET } from "../../../../../../generated/orgs/[org]/actions/cache/usage-by-repository/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
