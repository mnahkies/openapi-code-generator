import { _POST } from "../../../../../../../../generated/orgs/[org]/hooks/[hook_id]/deliveries/[delivery_id]/attempts/route"

export const POST = _POST(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
