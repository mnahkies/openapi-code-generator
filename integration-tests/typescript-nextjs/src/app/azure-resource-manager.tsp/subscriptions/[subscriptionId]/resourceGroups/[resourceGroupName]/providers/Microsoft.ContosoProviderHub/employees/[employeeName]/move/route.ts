import { _POST } from "../../../../../../../../../../../generated/azure-resource-manager.tsp/subscriptions/[subscriptionId]/resourceGroups/[resourceGroupName]/providers/Microsoft.ContosoProviderHub/employees/[employeeName]/move/route"

export const POST = _POST(async ({ params, query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
