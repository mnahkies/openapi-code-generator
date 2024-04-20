import { _GET } from "../../../../../../generated/projects/[project_id]/collaborators/[username]/permission/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
