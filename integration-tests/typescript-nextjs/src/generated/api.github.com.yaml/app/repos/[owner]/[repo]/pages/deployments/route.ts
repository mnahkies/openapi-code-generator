import { _POST } from "../../../../../../generated/repos/[owner]/[repo]/pages/deployments/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
