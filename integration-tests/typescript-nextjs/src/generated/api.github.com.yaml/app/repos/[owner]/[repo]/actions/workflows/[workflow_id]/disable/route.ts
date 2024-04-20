import { _PUT } from "../../../../../../../../generated/repos/[owner]/[repo]/actions/workflows/[workflow_id]/disable/route"

export const PUT = _PUT(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
