import { _GET } from "../../../generated/azure-core-data-plane-service.tsp/service-status/route"

export const GET = _GET(async ({ query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
