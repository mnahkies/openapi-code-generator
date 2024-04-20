import { _GET } from "../../../../../../generated/orgs/[org]/settings/network-settings/[network_settings_id]/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
