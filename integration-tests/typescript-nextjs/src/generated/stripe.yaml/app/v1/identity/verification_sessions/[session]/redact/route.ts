import { _POST } from "../../../../../../generated/v1/identity/verification_sessions/[session]/redact/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
