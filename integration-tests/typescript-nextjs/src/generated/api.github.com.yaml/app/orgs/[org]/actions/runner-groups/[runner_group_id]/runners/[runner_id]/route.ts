import {
  _PUT,
  _DELETE,
} from "../../../../../../../../generated/orgs/[org]/actions/runner-groups/[runner_group_id]/runners/[runner_id]/route"

export const PUT = _PUT(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
