import {
  _GET,
  _PUT,
} from "../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/actions/permissions/selected-actions/route"

export const GET = _GET(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const PUT = _PUT(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
