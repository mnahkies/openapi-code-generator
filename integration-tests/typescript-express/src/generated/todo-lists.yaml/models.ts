/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

export type t_Error = {
  code?: number | undefined
  message?: string | undefined
}

export type t_Statuses = ("incomplete" | "complete")[]

export type t_TodoList = {
  created: string
  id: string
  incompleteItemCount: number
  name: string
  totalItemCount: number
  updated: string
}

export type t_CreateTodoListItemParamSchema = {
  listId: string
}

export type t_CreateTodoListItemRequestBodySchema = {
  completedAt?: string | undefined
  content: string
  id: string
}

export type t_DeleteTodoListByIdParamSchema = {
  listId: string
}

export type t_UnknownObject = {
  [key: string]: unknown | undefined
}

export type t_GetTodoListByIdParamSchema = {
  listId: string
}

export type t_GetTodoListItemsParamSchema = {
  listId: string
}

export type t_GetTodoListsQuerySchema = {
  created?: string | undefined
  statuses?: t_Statuses | undefined
  tags?: string[] | undefined
}

export type t_UpdateTodoListByIdParamSchema = {
  listId: string
}

export type t_UpdateTodoListByIdRequestBodySchema = {
  name: string
}

export type t_UploadAttachmentRequestBodySchema = never
