import { _POST } from "../../../../../generated/user/codespaces/[codespace_name]/publish/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
