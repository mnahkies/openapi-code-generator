import { _PUT } from "../../../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/pulls/[pull_number]/reviews/[review_id]/dismissals/route"

export const PUT = _PUT(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
