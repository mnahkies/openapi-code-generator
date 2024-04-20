import {
  _GET,
  _PUT,
  _PATCH,
  _DELETE,
  _HEAD,
} from "../../../../../../../../../generated/subscriptions/[subscriptionId]/resourceGroups/[resourceGroupName]/providers/Microsoft.ContosoProviderHub/employees/[employeeName]/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const PUT = _PUT(async ({ params, query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const PATCH = _PATCH(
  async ({ params, query, body }, respond, context) => {
    // TODO: implementation
    return respond.withStatus(501).body({ message: "not implemented" } as any)
  },
)
export const DELETE = _DELETE(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const HEAD = _HEAD(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
