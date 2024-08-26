import { _GET } from "../../../../../../../../../generated/azure-resource-manager.tsp/subscriptions/[subscriptionId]/resourceGroups/[resourceGroupName]/providers/Microsoft.ContosoProviderHub/employees/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
