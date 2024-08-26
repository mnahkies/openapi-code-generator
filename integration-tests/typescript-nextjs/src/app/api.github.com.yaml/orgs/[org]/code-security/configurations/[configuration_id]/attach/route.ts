import { _POST } from "../../../../../../../../generated/api.github.com.yaml/orgs/[org]/code-security/configurations/[configuration_id]/attach/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
