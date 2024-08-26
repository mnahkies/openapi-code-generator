import {
  _PATCH,
  _GET,
  _DELETE,
} from "../../../../generated/azure-core-data-plane-service.tsp/widgets/[widgetName]/route"

export const PATCH = _PATCH(
  async ({ params, query, body }, respond, context) => {
    // TODO: implementation
    return respond.withStatus(501).body({ message: "not implemented" } as any)
  },
)
export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const DELETE = _DELETE(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
