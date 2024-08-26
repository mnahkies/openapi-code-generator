import {
  _GET,
  _PATCH,
} from "../../../../../generated/api.github.com.yaml/app/hook/config/route"

export const GET = _GET(async ({}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const PATCH = _PATCH(async ({ body }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
