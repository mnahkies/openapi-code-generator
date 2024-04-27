import { _DELETE } from "../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/actions/caches/[cache_id]/route"

export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
