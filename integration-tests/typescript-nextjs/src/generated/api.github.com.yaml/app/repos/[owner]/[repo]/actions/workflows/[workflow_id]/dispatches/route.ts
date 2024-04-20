import { _POST } from "../../../../../../../../generated/repos/[owner]/[repo]/actions/workflows/[workflow_id]/dispatches/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
