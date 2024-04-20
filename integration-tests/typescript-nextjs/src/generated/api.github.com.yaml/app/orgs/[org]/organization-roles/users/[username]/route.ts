import { _DELETE } from "../../../../../../generated/orgs/[org]/organization-roles/users/[username]/route"

export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
