import {TodoListsExampleApiServers} from "./generated/todo-lists.yaml/client.ts"

TodoListsExampleApiServers.server()

// @ts-expect-error should reject random urls
TodoListsExampleApiServers.server("https://random.example.com").build()

TodoListsExampleApiServers.server("https://todo-lists.example.com")
  // @ts-expect-error should have no params
  .build("foo")

TodoListsExampleApiServers.server(
  "{schema}://{tenant}.todo-lists.example.com",
  // @ts-expect-error should be a enum
).build("foo")

TodoListsExampleApiServers.server(
  "{schema}://{tenant}.todo-lists.example.com",
).build("https", "foo")

TodoListsExampleApiServers.operations.listAttachments()

TodoListsExampleApiServers.operations
  // @ts-expect-error should reject random urls
  .listAttachments("https://random.example.com")
  .build()

TodoListsExampleApiServers.operations
  .listAttachments("https://attachments.example.com")
  // @ts-expect-error should have no params
  .build("foo")

TodoListsExampleApiServers.operations
  .listAttachments("{schema}://{tenant}.attachments.example.com")
  // @ts-expect-error should be a enum
  .build("foo")

TodoListsExampleApiServers.operations
  .listAttachments("{schema}://{tenant}.attachments.example.com")
  .build("https", "foo")
