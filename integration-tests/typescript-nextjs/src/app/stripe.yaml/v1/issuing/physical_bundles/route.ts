import {_GET} from "../../../../../generated/stripe.yaml/v1/issuing/physical_bundles/route"

export const GET = _GET(async ({query, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
