import { _DELETE } from "../../../../../../../../generated/repos/[owner]/[repo]/comments/[comment_id]/reactions/[reaction_id]/route"

export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
