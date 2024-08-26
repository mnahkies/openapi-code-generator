import { _GET } from "../../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/issues/[issue_number]/assignees/[assignee]/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
