import { _POST } from "../../../../../../generated/repos/[owner]/[repo]/dependency-graph/snapshots/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
