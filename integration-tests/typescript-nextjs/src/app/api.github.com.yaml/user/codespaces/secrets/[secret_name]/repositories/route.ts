import {
  _GET,
  _PUT,
} from "../../../../../../../generated/api.github.com.yaml/user/codespaces/secrets/[secret_name]/repositories/route"

export const GET = _GET(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const PUT = _PUT(async ({params, body}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
