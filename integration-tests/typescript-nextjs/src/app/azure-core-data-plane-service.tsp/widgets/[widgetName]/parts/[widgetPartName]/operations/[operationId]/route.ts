import { _GET } from "../../../../../../../../generated/azure-core-data-plane-service.tsp/widgets/[widgetName]/parts/[widgetPartName]/operations/[operationId]/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
