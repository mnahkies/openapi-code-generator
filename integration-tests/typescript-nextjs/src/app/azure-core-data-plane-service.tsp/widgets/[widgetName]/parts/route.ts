import {
  _POST,
  _GET,
} from "../../../../../generated/azure-core-data-plane-service.tsp/widgets/[widgetName]/parts/route"

export const POST = _POST(async ({ params, query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
