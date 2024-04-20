import {_GET} from "../../../../../../generated/api.github.com.yaml/marketplace_listing/stubbed/accounts/[account_id]/route"

export const GET = _GET(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
