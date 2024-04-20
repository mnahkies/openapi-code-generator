import {_POST} from "../../../../../../../generated/api.github.com.yaml/orgs/[org]/actions/runners/generate-jitconfig/route"

export const POST = _POST(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
