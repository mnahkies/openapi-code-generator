import {
  _GET,
  _PUT,
  _DELETE,
} from "../../../../generated/api.github.com.yaml/user/interaction-limits/route"

export const GET = _GET(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const PUT = _PUT(async ({ body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const DELETE = _DELETE(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
