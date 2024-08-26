import { _POST } from "../../../../generated/azure-core-data-plane-service.tsp/widgets/[widgetName]:scheduleRepairs/route"

export const POST = _POST(async ({ params, query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
