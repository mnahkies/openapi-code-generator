import { _GET } from "../../../../../../../../../../../generated/repos/[owner]/[repo]/code-scanning/codeql/variant-analyses/[codeql_variant_analysis_id]/repos/[repo_owner]/[repo_name]/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
