import { _POST } from "../../../../../../../../../generated/repos/[owner]/[repo]/pulls/[pull_number]/reviews/[review_id]/events/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
