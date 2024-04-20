import { _DELETE } from "../../../../../../../generated/api.github.com.yaml/orgs/[org]/organization-roles/teams/[team_slug]/route"

export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
