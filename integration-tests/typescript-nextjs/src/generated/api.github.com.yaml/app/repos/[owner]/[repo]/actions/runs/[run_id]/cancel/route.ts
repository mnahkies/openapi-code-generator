import { _POST } from "../../../../../../../../generated/repos/[owner]/[repo]/actions/runs/[run_id]/cancel/route"

export const POST = _POST(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
