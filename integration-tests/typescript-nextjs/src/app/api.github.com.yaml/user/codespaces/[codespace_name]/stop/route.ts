import {_POST} from "../../../../../../generated/api.github.com.yaml/user/codespaces/[codespace_name]/stop/route"

export const POST = _POST(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
