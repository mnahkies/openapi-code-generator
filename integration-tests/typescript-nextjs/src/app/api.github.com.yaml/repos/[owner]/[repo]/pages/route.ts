import {
  _GET,
  _POST,
  _PUT,
  _DELETE,
} from "../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/pages/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const PUT = _PUT(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
