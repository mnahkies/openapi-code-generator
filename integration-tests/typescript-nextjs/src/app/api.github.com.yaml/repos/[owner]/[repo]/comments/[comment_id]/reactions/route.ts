import {
  _GET,
  _POST,
} from "../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/comments/[comment_id]/reactions/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
