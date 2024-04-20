import {_GET} from "../../../../../generated/stripe.yaml/v1/confirmation_tokens/[confirmation_token]/route"

export const GET = _GET(async ({params, query, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
