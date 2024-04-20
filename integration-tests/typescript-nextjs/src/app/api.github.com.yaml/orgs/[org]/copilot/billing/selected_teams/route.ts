import {
  _DELETE,
  _POST,
} from "../../../../../../../generated/api.github.com.yaml/orgs/[org]/copilot/billing/selected_teams/route"

export const POST = _POST(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const DELETE = _DELETE(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
