import { _DELETE } from "../../../../../generated/api.github.com.yaml/applications/[client_id]/grant/route"

export const DELETE = _DELETE(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
