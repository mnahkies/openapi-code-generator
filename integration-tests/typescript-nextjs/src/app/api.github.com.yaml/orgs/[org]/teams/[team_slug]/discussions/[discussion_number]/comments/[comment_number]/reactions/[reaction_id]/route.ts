import {_DELETE} from "../../../../../../../../../../../../generated/api.github.com.yaml/orgs/[org]/teams/[team_slug]/discussions/[discussion_number]/comments/[comment_number]/reactions/[reaction_id]/route"

export const DELETE = _DELETE(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
