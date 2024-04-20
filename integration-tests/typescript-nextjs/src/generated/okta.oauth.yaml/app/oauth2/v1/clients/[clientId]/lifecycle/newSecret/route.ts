import { _POST } from "../../../../../../../generated/oauth2/v1/clients/[clientId]/lifecycle/newSecret/route"

export const POST = _POST(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
