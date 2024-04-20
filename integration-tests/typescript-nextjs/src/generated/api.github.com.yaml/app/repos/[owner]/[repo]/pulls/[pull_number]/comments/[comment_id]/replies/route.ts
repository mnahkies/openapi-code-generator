import { _POST } from "../../../../../../../../../generated/repos/[owner]/[repo]/pulls/[pull_number]/comments/[comment_id]/replies/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
