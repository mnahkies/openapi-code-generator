import {TodoListsExampleApiServers} from "./generated/todo-lists.yaml/client.ts"
import type {t_TodoEvent} from "./generated/todo-lists.yaml/models.ts"

// const-based discriminators must allow narrowing the union by literal type
declare const t_event: t_TodoEvent
if (t_event.kind === "created") {
  const createdAt: string = t_event.createdAt
  void createdAt
  // @ts-expect-error `t_TodoCreatedEvent` has no `completedAt` property
  const completedAt: string = t_event.completedAt
  void completedAt
}
if (t_event.kind === "completed") {
  const completedAt: string = t_event.completedAt
  void completedAt
  // @ts-expect-error `t_TodoCompletedEvent` has no `createdAt` property
  const createdAt: string = t_event.createdAt
  void createdAt
}

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
