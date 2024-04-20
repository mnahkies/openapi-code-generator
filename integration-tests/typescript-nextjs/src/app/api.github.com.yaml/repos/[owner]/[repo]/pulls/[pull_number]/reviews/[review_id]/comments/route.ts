import { _GET } from "../../../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/pulls/[pull_number]/reviews/[review_id]/comments/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
