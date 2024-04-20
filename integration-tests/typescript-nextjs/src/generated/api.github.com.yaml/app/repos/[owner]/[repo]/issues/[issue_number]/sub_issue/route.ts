import { _DELETE } from "../../../../../../../generated/repos/[owner]/[repo]/issues/[issue_number]/sub_issue/route"

export const DELETE = _DELETE(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
