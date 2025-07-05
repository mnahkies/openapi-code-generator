import {_GET} from "../../../generated/todo-lists.yaml/list/route"

export const GET = _GET(
  async ({query}, respond, request) => {
    // TODO: implementation
    return respond.withStatus(501).body({message: "not implemented"} as any)
  },
  async (err) => {
    // TODO: implementation
    return new Response(JSON.stringify({message: "not implemented"}), {
      status: 501,
    })
  },
)
