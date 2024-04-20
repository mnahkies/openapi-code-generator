import { _GET } from "../../../generated/v1/invoice_rendering_templates/route"

export const GET = _GET(async ({ query, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
