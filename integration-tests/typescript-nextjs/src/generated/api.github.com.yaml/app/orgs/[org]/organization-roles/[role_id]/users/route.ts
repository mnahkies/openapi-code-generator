import { _GET } from "../../../../../../generated/orgs/[org]/organization-roles/[role_id]/users/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
