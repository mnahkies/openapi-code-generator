import { _POST } from "../../../../../../../generated/repos/[owner]/[repo]/security-advisories/[ghsa_id]/forks/route"

export const POST = _POST(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
