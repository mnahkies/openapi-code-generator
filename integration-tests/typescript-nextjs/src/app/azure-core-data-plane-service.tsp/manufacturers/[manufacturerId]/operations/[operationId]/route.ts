import { _GET } from "../../../../../../generated/azure-core-data-plane-service.tsp/manufacturers/[manufacturerId]/operations/[operationId]/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
