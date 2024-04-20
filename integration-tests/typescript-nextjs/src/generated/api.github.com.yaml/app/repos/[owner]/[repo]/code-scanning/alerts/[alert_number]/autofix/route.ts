import {
  _GET,
  _POST,
} from "../../../../../../../../generated/repos/[owner]/[repo]/code-scanning/alerts/[alert_number]/autofix/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const POST = _POST(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
