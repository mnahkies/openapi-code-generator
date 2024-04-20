import {
  _PUT,
  _DELETE,
} from "../../../../../../../../generated/orgs/[org]/actions/secrets/[secret_name]/repositories/[repository_id]/route"

export const PUT = _PUT(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
