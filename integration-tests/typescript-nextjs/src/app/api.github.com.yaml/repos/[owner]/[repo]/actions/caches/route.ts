import {
  _DELETE,
  _GET,
} from "../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/actions/caches/route"

export const GET = _GET(async ({params, query}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const DELETE = _DELETE(async ({params, query}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
