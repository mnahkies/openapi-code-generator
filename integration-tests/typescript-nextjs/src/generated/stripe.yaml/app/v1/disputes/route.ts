import { _GET } from "../../../generated/v1/disputes/route"

export const GET = _GET(async ({ query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
