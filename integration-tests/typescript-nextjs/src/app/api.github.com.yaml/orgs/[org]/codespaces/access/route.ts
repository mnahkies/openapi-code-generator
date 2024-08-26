import { _PUT } from "../../../../../../generated/api.github.com.yaml/orgs/[org]/codespaces/access/route"

export const PUT = _PUT(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
