import type {GetTodoLists} from "@/app/api/list/route"

export const GET: GetTodoLists = async (params, respond, ctx) => {
  return respond.withStatus(404).body({})
}
