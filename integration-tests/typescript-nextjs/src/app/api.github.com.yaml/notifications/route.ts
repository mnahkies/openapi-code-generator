import {
  _GET,
  _PUT,
} from "../../../generated/api.github.com.yaml/notifications/route"

export const GET = _GET(async ({query}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const PUT = _PUT(async ({body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
