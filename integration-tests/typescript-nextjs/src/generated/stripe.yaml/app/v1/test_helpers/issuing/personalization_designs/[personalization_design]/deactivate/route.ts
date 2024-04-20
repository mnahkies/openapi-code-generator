import { _POST } from "../../../../../../../generated/v1/test_helpers/issuing/personalization_designs/[personalization_design]/deactivate/route"

export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
