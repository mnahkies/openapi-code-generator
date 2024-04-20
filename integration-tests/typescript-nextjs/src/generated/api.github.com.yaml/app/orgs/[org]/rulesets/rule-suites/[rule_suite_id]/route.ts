import { _GET } from "../../../../../../generated/orgs/[org]/rulesets/rule-suites/[rule_suite_id]/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
