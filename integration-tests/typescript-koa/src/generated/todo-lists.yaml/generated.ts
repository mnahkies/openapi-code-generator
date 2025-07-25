/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {
  t_CreateTodoListItemBodySchema,
  t_CreateTodoListItemParamSchema,
  t_DeleteTodoListByIdParamSchema,
  t_Error,
  t_GetTodoListByIdParamSchema,
  t_GetTodoListItemsParamSchema,
  t_GetTodoListsQuerySchema,
  t_TodoList,
  t_UnknownObject,
  t_UpdateTodoListByIdBodySchema,
  t_UpdateTodoListByIdParamSchema,
  t_UploadAttachmentBodySchema,
} from "./models"
import {
  s_CreateUpdateTodoList,
  s_Error,
  s_Statuses,
  s_TodoList,
  s_UnknownObject,
} from "./schemas"
import KoaRouter, {RouterContext} from "@koa/router"
import {
  KoaRuntimeError,
  RequestInputType,
} from "@nahkies/typescript-koa-runtime/errors"
import {
  KoaRuntimeResponder,
  KoaRuntimeResponse,
  Params,
  Response,
  ServerConfig,
  SkipResponse,
  StatusCode,
  StatusCode4xx,
  StatusCode5xx,
  startServer,
} from "@nahkies/typescript-koa-runtime/server"
import {
  parseRequestInput,
  responseValidationFactory,
} from "@nahkies/typescript-koa-runtime/zod"
import {Next} from "koa"
import {z} from "zod"

export type GetTodoListsResponder = {
  with200(): KoaRuntimeResponse<t_TodoList[]>
} & KoaRuntimeResponder

export type GetTodoLists = (
  params: Params<void, t_GetTodoListsQuerySchema, void, void>,
  respond: GetTodoListsResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_TodoList[]>
  | typeof SkipResponse
>

export type GetTodoListByIdResponder = {
  with200(): KoaRuntimeResponse<t_TodoList>
  withStatusCode4xx(status: StatusCode4xx): KoaRuntimeResponse<t_Error>
  withDefault(status: StatusCode): KoaRuntimeResponse<void>
} & KoaRuntimeResponder

export type GetTodoListById = (
  params: Params<t_GetTodoListByIdParamSchema, void, void, void>,
  respond: GetTodoListByIdResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_TodoList>
  | Response<StatusCode4xx, t_Error>
  | Response<StatusCode, void>
  | typeof SkipResponse
>

export type UpdateTodoListByIdResponder = {
  with200(): KoaRuntimeResponse<t_TodoList>
  withStatusCode4xx(status: StatusCode4xx): KoaRuntimeResponse<t_Error>
  withDefault(status: StatusCode): KoaRuntimeResponse<void>
} & KoaRuntimeResponder

export type UpdateTodoListById = (
  params: Params<
    t_UpdateTodoListByIdParamSchema,
    void,
    t_UpdateTodoListByIdBodySchema,
    void
  >,
  respond: UpdateTodoListByIdResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_TodoList>
  | Response<StatusCode4xx, t_Error>
  | Response<StatusCode, void>
  | typeof SkipResponse
>

export type DeleteTodoListByIdResponder = {
  with204(): KoaRuntimeResponse<void>
  withStatusCode4xx(status: StatusCode4xx): KoaRuntimeResponse<t_Error>
  withDefault(status: StatusCode): KoaRuntimeResponse<void>
} & KoaRuntimeResponder

export type DeleteTodoListById = (
  params: Params<t_DeleteTodoListByIdParamSchema, void, void, void>,
  respond: DeleteTodoListByIdResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<204, void>
  | Response<StatusCode4xx, t_Error>
  | Response<StatusCode, void>
  | typeof SkipResponse
>

export type GetTodoListItemsResponder = {
  with200(): KoaRuntimeResponse<{
    completedAt?: string
    content: string
    createdAt: string
    id: string
  }>
  withStatusCode5xx(status: StatusCode5xx): KoaRuntimeResponse<{
    code: string
    message: string
  }>
} & KoaRuntimeResponder

export type GetTodoListItems = (
  params: Params<t_GetTodoListItemsParamSchema, void, void, void>,
  respond: GetTodoListItemsResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<
      200,
      {
        completedAt?: string
        content: string
        createdAt: string
        id: string
      }
    >
  | Response<
      StatusCode5xx,
      {
        code: string
        message: string
      }
    >
  | typeof SkipResponse
>

export type CreateTodoListItemResponder = {
  with204(): KoaRuntimeResponse<void>
} & KoaRuntimeResponder

export type CreateTodoListItem = (
  params: Params<
    t_CreateTodoListItemParamSchema,
    void,
    t_CreateTodoListItemBodySchema,
    void
  >,
  respond: CreateTodoListItemResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  KoaRuntimeResponse<unknown> | Response<204, void> | typeof SkipResponse
>

export type ListAttachmentsResponder = {
  with200(): KoaRuntimeResponse<t_UnknownObject[]>
} & KoaRuntimeResponder

export type ListAttachments = (
  params: Params<void, void, void, void>,
  respond: ListAttachmentsResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_UnknownObject[]>
  | typeof SkipResponse
>

export type UploadAttachmentResponder = {
  with202(): KoaRuntimeResponse<void>
} & KoaRuntimeResponder

export type UploadAttachment = (
  params: Params<void, void, t_UploadAttachmentBodySchema, void>,
  respond: UploadAttachmentResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  KoaRuntimeResponse<unknown> | Response<202, void> | typeof SkipResponse
>

export type Implementation = {
  getTodoLists: GetTodoLists
  getTodoListById: GetTodoListById
  updateTodoListById: UpdateTodoListById
  deleteTodoListById: DeleteTodoListById
  getTodoListItems: GetTodoListItems
  createTodoListItem: CreateTodoListItem
  listAttachments: ListAttachments
  uploadAttachment: UploadAttachment
}

export function createRouter(implementation: Implementation): KoaRouter {
  const router = new KoaRouter()

  const getTodoListsQuerySchema = z.object({
    created: z.string().datetime({offset: true}).optional(),
    statuses: z
      .preprocess(
        (it: unknown) => (Array.isArray(it) || it === undefined ? it : [it]),
        s_Statuses,
      )
      .optional(),
    tags: z
      .preprocess(
        (it: unknown) => (Array.isArray(it) || it === undefined ? it : [it]),
        z.array(z.string()),
      )
      .optional(),
  })

  const getTodoListsResponseValidator = responseValidationFactory(
    [["200", z.array(s_TodoList)]],
    undefined,
  )

  router.get("getTodoLists", "/list", async (ctx, next) => {
    const input = {
      params: undefined,
      query: parseRequestInput(
        getTodoListsQuerySchema,
        ctx.query,
        RequestInputType.QueryString,
      ),
      body: undefined,
      headers: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<t_TodoList[]>(200)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .getTodoLists(input, responder, ctx, next)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    // escape hatch to allow responses to be sent by the implementation handler
    if (response === SkipResponse) {
      return
    }

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = getTodoListsResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  const getTodoListByIdParamSchema = z.object({listId: z.string()})

  const getTodoListByIdResponseValidator = responseValidationFactory(
    [
      ["200", s_TodoList],
      ["4XX", s_Error],
    ],
    z.undefined(),
  )

  router.get("getTodoListById", "/list/:listId", async (ctx, next) => {
    const input = {
      params: parseRequestInput(
        getTodoListByIdParamSchema,
        ctx.params,
        RequestInputType.RouteParam,
      ),
      query: undefined,
      body: undefined,
      headers: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<t_TodoList>(200)
      },
      withStatusCode4xx(status: StatusCode4xx) {
        return new KoaRuntimeResponse<t_Error>(status)
      },
      withDefault(status: StatusCode) {
        return new KoaRuntimeResponse<void>(status)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .getTodoListById(input, responder, ctx, next)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    // escape hatch to allow responses to be sent by the implementation handler
    if (response === SkipResponse) {
      return
    }

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = getTodoListByIdResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  const updateTodoListByIdParamSchema = z.object({listId: z.string()})

  const updateTodoListByIdBodySchema = s_CreateUpdateTodoList

  const updateTodoListByIdResponseValidator = responseValidationFactory(
    [
      ["200", s_TodoList],
      ["4XX", s_Error],
    ],
    z.undefined(),
  )

  router.put("updateTodoListById", "/list/:listId", async (ctx, next) => {
    const input = {
      params: parseRequestInput(
        updateTodoListByIdParamSchema,
        ctx.params,
        RequestInputType.RouteParam,
      ),
      query: undefined,
      body: parseRequestInput(
        updateTodoListByIdBodySchema,
        Reflect.get(ctx.request, "body"),
        RequestInputType.RequestBody,
      ),
      headers: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<t_TodoList>(200)
      },
      withStatusCode4xx(status: StatusCode4xx) {
        return new KoaRuntimeResponse<t_Error>(status)
      },
      withDefault(status: StatusCode) {
        return new KoaRuntimeResponse<void>(status)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .updateTodoListById(input, responder, ctx, next)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    // escape hatch to allow responses to be sent by the implementation handler
    if (response === SkipResponse) {
      return
    }

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = updateTodoListByIdResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  const deleteTodoListByIdParamSchema = z.object({listId: z.string()})

  const deleteTodoListByIdResponseValidator = responseValidationFactory(
    [
      ["204", z.undefined()],
      ["4XX", s_Error],
    ],
    z.undefined(),
  )

  router.delete("deleteTodoListById", "/list/:listId", async (ctx, next) => {
    const input = {
      params: parseRequestInput(
        deleteTodoListByIdParamSchema,
        ctx.params,
        RequestInputType.RouteParam,
      ),
      query: undefined,
      body: undefined,
      headers: undefined,
    }

    const responder = {
      with204() {
        return new KoaRuntimeResponse<void>(204)
      },
      withStatusCode4xx(status: StatusCode4xx) {
        return new KoaRuntimeResponse<t_Error>(status)
      },
      withDefault(status: StatusCode) {
        return new KoaRuntimeResponse<void>(status)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .deleteTodoListById(input, responder, ctx, next)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    // escape hatch to allow responses to be sent by the implementation handler
    if (response === SkipResponse) {
      return
    }

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = deleteTodoListByIdResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  const getTodoListItemsParamSchema = z.object({listId: z.string()})

  const getTodoListItemsResponseValidator = responseValidationFactory(
    [
      [
        "200",
        z.object({
          id: z.string(),
          content: z.string(),
          createdAt: z.string().datetime({offset: true}),
          completedAt: z.string().datetime({offset: true}).optional(),
        }),
      ],
      ["5XX", z.object({message: z.string(), code: z.string()})],
    ],
    undefined,
  )

  router.get("getTodoListItems", "/list/:listId/items", async (ctx, next) => {
    const input = {
      params: parseRequestInput(
        getTodoListItemsParamSchema,
        ctx.params,
        RequestInputType.RouteParam,
      ),
      query: undefined,
      body: undefined,
      headers: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<{
          completedAt?: string
          content: string
          createdAt: string
          id: string
        }>(200)
      },
      withStatusCode5xx(status: StatusCode5xx) {
        return new KoaRuntimeResponse<{
          code: string
          message: string
        }>(status)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .getTodoListItems(input, responder, ctx, next)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    // escape hatch to allow responses to be sent by the implementation handler
    if (response === SkipResponse) {
      return
    }

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = getTodoListItemsResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  const createTodoListItemParamSchema = z.object({listId: z.string()})

  const createTodoListItemBodySchema = z.object({
    id: z.string(),
    content: z.string(),
    completedAt: z.string().datetime({offset: true}).optional(),
  })

  const createTodoListItemResponseValidator = responseValidationFactory(
    [["204", z.undefined()]],
    undefined,
  )

  router.post(
    "createTodoListItem",
    "/list/:listId/items",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          createTodoListItemParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: undefined,
        body: parseRequestInput(
          createTodoListItemBodySchema,
          Reflect.get(ctx.request, "body"),
          RequestInputType.RequestBody,
        ),
        headers: undefined,
      }

      const responder = {
        with204() {
          return new KoaRuntimeResponse<void>(204)
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .createTodoListItem(input, responder, ctx, next)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      // escape hatch to allow responses to be sent by the implementation handler
      if (response === SkipResponse) {
        return
      }

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = createTodoListItemResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const listAttachmentsResponseValidator = responseValidationFactory(
    [["200", z.array(s_UnknownObject)]],
    undefined,
  )

  router.get("listAttachments", "/attachments", async (ctx, next) => {
    const input = {
      params: undefined,
      query: undefined,
      body: undefined,
      headers: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<t_UnknownObject[]>(200)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .listAttachments(input, responder, ctx, next)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    // escape hatch to allow responses to be sent by the implementation handler
    if (response === SkipResponse) {
      return
    }

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = listAttachmentsResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  // todo: request bodies with content-type 'multipart/form-data' not yet supported

  const uploadAttachmentBodySchema = z.never()

  const uploadAttachmentResponseValidator = responseValidationFactory(
    [["202", z.undefined()]],
    undefined,
  )

  router.post("uploadAttachment", "/attachments", async (ctx, next) => {
    const input = {
      params: undefined,
      query: undefined,
      body: parseRequestInput(
        uploadAttachmentBodySchema,
        Reflect.get(ctx.request, "body"),
        RequestInputType.RequestBody,
      ),
      headers: undefined,
    }

    const responder = {
      with202() {
        return new KoaRuntimeResponse<void>(202)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .uploadAttachment(input, responder, ctx, next)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    // escape hatch to allow responses to be sent by the implementation handler
    if (response === SkipResponse) {
      return
    }

    const {status, body} =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = uploadAttachmentResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  return router
}

export async function bootstrap(config: ServerConfig) {
  // Todo Lists Example API
  return startServer(config)
}
