import { _PUT } from "../../../../../../../generated/repos/[owner]/[repo]/pulls/[pull_number]/update-branch/route"

export const PUT = _PUT(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
