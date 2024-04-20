import { _PATCH } from "../../../../generated/user/email/visibility/route"

export const PATCH = _PATCH(async ({ body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
