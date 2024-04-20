import { _POST } from "../../../../../generated/orgs/[org]/[security_product]/[enablement]/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
