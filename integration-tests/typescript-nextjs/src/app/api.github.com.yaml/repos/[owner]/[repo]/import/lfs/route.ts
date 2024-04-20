import {_PATCH} from "../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/import/lfs/route"

export const PATCH = _PATCH(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
