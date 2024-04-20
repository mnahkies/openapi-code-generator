import { _POST } from "../../../../../../generated/repos/[owner]/[repo]/secret-scanning/push-protection-bypasses/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
