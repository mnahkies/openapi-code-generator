import {
  _GET,
  _DELETE,
} from "../../../../../../../generated/repos/[owner]/[repo]/code-scanning/analyses/[analysis_id]/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const DELETE = _DELETE(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
