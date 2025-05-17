import {_GET} from "../../../generated/todo-lists.yaml/list/route"

export const GET = _GET(async ({query}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
