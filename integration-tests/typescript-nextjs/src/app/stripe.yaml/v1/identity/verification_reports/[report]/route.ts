import {_GET} from "../../../../../../generated/stripe.yaml/v1/identity/verification_reports/[report]/route"

export const GET = _GET(async ({params, query, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
