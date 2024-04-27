import {
  _PUT,
  _DELETE,
} from "../../../../../../generated/api.github.com.yaml/projects/[project_id]/collaborators/[username]/route"

export const PUT = _PUT(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
