import {
  _DELETE,
  _GET,
  _POST,
} from "../../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/branches/[branch]/protection/required_signatures/route"

export const GET = _GET(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const POST = _POST(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const DELETE = _DELETE(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
