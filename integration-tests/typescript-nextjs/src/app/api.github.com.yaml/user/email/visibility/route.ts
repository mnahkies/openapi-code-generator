import {_PATCH} from "../../../../../generated/api.github.com.yaml/user/email/visibility/route"

export const PATCH = _PATCH(async ({body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
