import { _DELETE } from "../../../../../../../../generated/orgs/[org]/actions/runners/[runner_id]/labels/[name]/route"

export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
