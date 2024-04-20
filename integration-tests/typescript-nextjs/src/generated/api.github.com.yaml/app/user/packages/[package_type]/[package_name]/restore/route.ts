import { _POST } from "../../../../../../generated/user/packages/[package_type]/[package_name]/restore/route"

export const POST = _POST(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
