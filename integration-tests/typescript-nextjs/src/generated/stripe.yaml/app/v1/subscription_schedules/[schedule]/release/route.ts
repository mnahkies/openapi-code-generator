import { _POST } from "../../../../../generated/v1/subscription_schedules/[schedule]/release/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
