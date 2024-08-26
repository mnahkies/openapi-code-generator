import {
  _PATCH,
  _DELETE,
} from "../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/invitations/[invitation_id]/route"

export const PATCH = _PATCH(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
