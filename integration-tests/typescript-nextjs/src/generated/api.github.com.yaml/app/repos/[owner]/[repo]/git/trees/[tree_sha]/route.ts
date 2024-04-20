import { _GET } from "../../../../../../../generated/repos/[owner]/[repo]/git/trees/[tree_sha]/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
