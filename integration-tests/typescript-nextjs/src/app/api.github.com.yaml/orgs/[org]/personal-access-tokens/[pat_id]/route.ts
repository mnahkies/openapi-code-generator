import {_POST} from "../../../../../../generated/api.github.com.yaml/orgs/[org]/personal-access-tokens/[pat_id]/route"

export const POST = _POST(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
