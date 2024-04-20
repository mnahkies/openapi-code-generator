import {_GET} from "../../../../../generated/stripe.yaml/v1/financial_connections/accounts/route"

export const GET = _GET(async ({query, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
