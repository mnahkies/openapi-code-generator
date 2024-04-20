import {
  _DELETE,
  _PUT,
} from "../../../../../../../generated/api.github.com.yaml/orgs/[org]/security-managers/teams/[team_slug]/route"

export const PUT = _PUT(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const DELETE = _DELETE(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
