import {_GET} from "../../../../../../generated/api.github.com.yaml/user/codespaces/secrets/public-key/route"

export const GET = _GET(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
