import {
  type GetTodoLists,
  bootstrap,
  createRouter,
} from "./generated/todo-lists.yaml/generated"
import type {t_TodoList} from "./generated/todo-lists.yaml/models"
import {genericErrorMiddleware, notImplemented} from "./petstore-expanded.yaml"

const getTodoLists: GetTodoLists = async ({query}, respond) => {
  console.info("query", {query})
  return respond.with200().body([] as t_TodoList[])
}

async function main() {
  const {server, address} = await bootstrap({
    router: createRouter({
      getTodoLists,
      getTodoListById: notImplemented,
      updateTodoListById: notImplemented,
      deleteTodoListById: notImplemented,
      getTodoListItems: notImplemented,
      createTodoListItem: notImplemented,
      listAttachments: notImplemented,
      uploadAttachment: notImplemented,
    }),
    middleware: [genericErrorMiddleware],
    port: {port: 3000, host: "127.0.0.1"},
  })

  console.info(`listening on http://${address.address}:${address.port}`)

  process.on("SIGTERM", () => {
    console.info("sigterm received, closing server")
    server.close()
  })
}

if (require.main === module) {
  main().catch((err) => {
    console.error("unhandled exception", err)
    process.exit(1)
  })
}
