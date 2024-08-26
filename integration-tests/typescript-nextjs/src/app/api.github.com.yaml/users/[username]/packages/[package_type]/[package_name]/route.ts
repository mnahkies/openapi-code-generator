import {
  _GET,
  _DELETE,
} from "../../../../../../../generated/api.github.com.yaml/users/[username]/packages/[package_type]/[package_name]/route"

export const GET = _GET(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const DELETE = _DELETE(async ({ params }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
