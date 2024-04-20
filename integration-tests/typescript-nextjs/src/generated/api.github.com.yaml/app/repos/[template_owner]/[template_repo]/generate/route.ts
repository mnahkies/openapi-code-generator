import { _POST } from "../../../../../generated/repos/[template_owner]/[template_repo]/generate/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
