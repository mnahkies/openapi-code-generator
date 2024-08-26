import { _PUT } from "../../../../../../../../generated/api.github.com.yaml/orgs/[org]/code-security/configurations/[configuration_id]/defaults/route"

export const PUT = _PUT(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
