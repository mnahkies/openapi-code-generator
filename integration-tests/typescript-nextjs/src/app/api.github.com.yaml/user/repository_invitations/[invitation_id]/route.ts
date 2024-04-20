import {
  _DELETE,
  _PATCH,
} from "../../../../../generated/api.github.com.yaml/user/repository_invitations/[invitation_id]/route"

export const PATCH = _PATCH(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const DELETE = _DELETE(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
