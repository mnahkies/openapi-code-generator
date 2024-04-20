import {
  _GET,
  _PATCH,
} from "../../../../../../../generated/idp/myaccount/authenticators/[authenticatorId]/enrollments/[enrollmentId]/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const PATCH = _PATCH(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
