import {
  _GET,
  _POST,
} from "../../../../../../../../generated/api.github.com.yaml/repos/[owner]/[repo]/environments/[environment_name]/deployment_protection_rules/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const POST = _POST(async ({ params, body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
