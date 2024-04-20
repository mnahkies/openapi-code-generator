import {
  _PUT,
  _DELETE,
} from "../../../../../../../generated/orgs/[org]/organization-roles/teams/[team_slug]/[role_id]/route"

export const PUT = _PUT(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
