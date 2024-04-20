import {
  _GET,
  _PATCH,
} from "../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/secret-scanning/alerts/[alert_number]/route"

export const GET = _GET(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const PATCH = _PATCH(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
