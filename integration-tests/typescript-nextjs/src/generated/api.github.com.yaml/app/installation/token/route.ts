import { _DELETE } from "../../../generated/installation/token/route"

export const DELETE = _DELETE(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
