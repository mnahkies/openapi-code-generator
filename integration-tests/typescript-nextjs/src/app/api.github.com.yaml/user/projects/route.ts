import { _POST } from "../../../../generated/api.github.com.yaml/user/projects/route"

export const POST = _POST(async ({ body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
