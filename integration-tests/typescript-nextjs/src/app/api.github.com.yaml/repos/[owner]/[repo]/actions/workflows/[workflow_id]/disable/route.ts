import {_PUT} from "../../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/actions/workflows/[workflow_id]/disable/route"

export const PUT = _PUT(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
