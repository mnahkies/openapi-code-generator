import { _DELETE } from "../../../../../../../generated/orgs/[org]/members/[username]/codespaces/[codespace_name]/route"

export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
