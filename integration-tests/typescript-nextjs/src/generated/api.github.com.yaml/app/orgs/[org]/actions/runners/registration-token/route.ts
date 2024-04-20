import { _POST } from "../../../../../../generated/orgs/[org]/actions/runners/registration-token/route"

export const POST = _POST(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
