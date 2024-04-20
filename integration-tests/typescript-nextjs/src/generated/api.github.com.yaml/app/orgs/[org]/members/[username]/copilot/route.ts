import { _GET } from "../../../../../../generated/orgs/[org]/members/[username]/copilot/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
