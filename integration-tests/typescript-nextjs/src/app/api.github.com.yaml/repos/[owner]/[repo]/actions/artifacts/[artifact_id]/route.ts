import {
  _DELETE,
  _GET,
} from "../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/actions/artifacts/[artifact_id]/route"

export const GET = _GET(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const DELETE = _DELETE(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
