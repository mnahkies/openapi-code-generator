import { _GET } from "../../../../../../../generated/api.github.com.yaml/user/codespaces/[codespace_name]/exports/[export_id]/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
