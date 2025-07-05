import {
  _GET,
  _POST,
} from "../../../../../generated/todo-lists.yaml/list/[listId]/items/route"

export const GET = _GET(
  async ({params}, respond, request) => {
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
export const POST = _POST(
  async ({params, body}, respond, request) => {
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
