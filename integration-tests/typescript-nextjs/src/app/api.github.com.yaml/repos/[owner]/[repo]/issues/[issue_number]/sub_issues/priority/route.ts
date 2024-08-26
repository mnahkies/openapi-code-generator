import { _PATCH } from "../../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/issues/[issue_number]/sub_issues/priority/route"

export const PATCH = _PATCH(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
