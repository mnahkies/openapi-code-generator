import { _POST } from "../../../../../../../../../../generated/api.github.com.yaml/orgs/[org]/packages/[package_type]/[package_name]/versions/[package_version_id]/restore/route"

export const POST = _POST(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
