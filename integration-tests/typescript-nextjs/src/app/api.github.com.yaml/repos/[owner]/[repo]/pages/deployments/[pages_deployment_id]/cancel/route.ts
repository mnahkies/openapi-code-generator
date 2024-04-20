import {_POST} from "../../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/pages/deployments/[pages_deployment_id]/cancel/route"

export const POST = _POST(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
