import { _DELETE } from "../../../../../../../../generated/repos/[owner]/[repo]/issues/[issue_number]/reactions/[reaction_id]/route"

export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
