import { _POST } from "../../../../../../../generated/enterprises/[enterprise]/code-security/configurations/[configuration_id]/attach/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
