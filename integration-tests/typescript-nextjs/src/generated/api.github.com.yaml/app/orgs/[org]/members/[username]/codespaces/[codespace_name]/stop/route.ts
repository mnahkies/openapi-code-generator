import { _POST } from "../../../../../../../../generated/orgs/[org]/members/[username]/codespaces/[codespace_name]/stop/route"

export const POST = _POST(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
