import { _POST } from "../../../../../generated/v1/invoice_rendering_templates/[template]/unarchive/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
