import {
  _GET,
  _PUT,
} from "../../../../../../../generated/api.github.com.yaml/orgs/[org]/actions/permissions/repositories/route"

export const GET = _GET(async ({params, query}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const PUT = _PUT(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
