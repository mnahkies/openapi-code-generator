import {_GET} from "../../../generated/api.github.com.yaml/codes_of_conduct/route"

export const GET = _GET(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
