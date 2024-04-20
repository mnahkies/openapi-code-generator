import { _GET } from "../../../../../../../../generated/repos/[owner]/[repo]/actions/runs/[run_id]/approvals/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
