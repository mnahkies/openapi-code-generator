import { _POST } from "../../../../../../generated/v1/test_helpers/issuing/transactions/create_force_capture/route"

export const POST = _POST(async ({ body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
