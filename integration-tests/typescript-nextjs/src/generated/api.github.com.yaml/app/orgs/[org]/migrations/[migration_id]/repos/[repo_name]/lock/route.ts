import { _DELETE } from "../../../../../../../../generated/orgs/[org]/migrations/[migration_id]/repos/[repo_name]/lock/route"

export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
