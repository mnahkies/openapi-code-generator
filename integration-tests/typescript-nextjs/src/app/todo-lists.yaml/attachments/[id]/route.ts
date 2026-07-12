import {_PUT} from "@/generated/todo-lists.yaml/attachments/[id]/route"

export const PUT = _PUT(
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
