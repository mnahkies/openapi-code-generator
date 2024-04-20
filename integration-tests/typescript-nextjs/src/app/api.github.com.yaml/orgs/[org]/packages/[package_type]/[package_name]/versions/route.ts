import {_GET} from "../../../../../../../../generated/api.github.com.yaml/orgs/[org]/packages/[package_type]/[package_name]/versions/route"

export const GET = _GET(async ({params, query}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
