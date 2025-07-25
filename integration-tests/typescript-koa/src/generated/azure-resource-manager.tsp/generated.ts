/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {
  t_Azure_ResourceManager_CommonTypes_ErrorResponse,
  t_Employee,
  t_EmployeeListResult,
  t_EmployeesCheckExistenceParamSchema,
  t_EmployeesCheckExistenceQuerySchema,
  t_EmployeesCreateOrUpdateBodySchema,
  t_EmployeesCreateOrUpdateParamSchema,
  t_EmployeesCreateOrUpdateQuerySchema,
  t_EmployeesDeleteParamSchema,
  t_EmployeesDeleteQuerySchema,
  t_EmployeesGetParamSchema,
  t_EmployeesGetQuerySchema,
  t_EmployeesListByResourceGroupParamSchema,
  t_EmployeesListByResourceGroupQuerySchema,
  t_EmployeesListBySubscriptionParamSchema,
  t_EmployeesListBySubscriptionQuerySchema,
  t_EmployeesMoveBodySchema,
  t_EmployeesMoveParamSchema,
  t_EmployeesMoveQuerySchema,
  t_EmployeesUpdateBodySchema,
  t_EmployeesUpdateParamSchema,
  t_EmployeesUpdateQuerySchema,
  t_MoveResponse,
  t_OperationListResult,
  t_OperationsListQuerySchema,
} from "./models"
import {
  s_Azure_Core_uuid,
  s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  s_Employee,
  s_EmployeeListResult,
  s_EmployeeUpdate,
  s_MoveRequest,
  s_MoveResponse,
  s_OperationListResult,
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
  startServer,
} from "@nahkies/typescript-koa-runtime/server"
import {
  parseRequestInput,
  responseValidationFactory,
} from "@nahkies/typescript-koa-runtime/zod"
import {Next} from "koa"
import {z} from "zod"

export type OperationsListResponder = {
  with200(): KoaRuntimeResponse<t_OperationListResult>
  withDefault(
    status: StatusCode,
  ): KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & KoaRuntimeResponder

export type OperationsList = (
  params: Params<void, t_OperationsListQuerySchema, void, void>,
  respond: OperationsListResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_OperationListResult>
  | Response<StatusCode, t_Azure_ResourceManager_CommonTypes_ErrorResponse>
  | typeof SkipResponse
>

export type EmployeesGetResponder = {
  with200(): KoaRuntimeResponse<t_Employee>
  withDefault(
    status: StatusCode,
  ): KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & KoaRuntimeResponder

export type EmployeesGet = (
  params: Params<
    t_EmployeesGetParamSchema,
    t_EmployeesGetQuerySchema,
    void,
    void
  >,
  respond: EmployeesGetResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_Employee>
  | Response<StatusCode, t_Azure_ResourceManager_CommonTypes_ErrorResponse>
  | typeof SkipResponse
>

export type EmployeesCreateOrUpdateResponder = {
  with200(): KoaRuntimeResponse<t_Employee>
  with201(): KoaRuntimeResponse<t_Employee>
  withDefault(
    status: StatusCode,
  ): KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & KoaRuntimeResponder

export type EmployeesCreateOrUpdate = (
  params: Params<
    t_EmployeesCreateOrUpdateParamSchema,
    t_EmployeesCreateOrUpdateQuerySchema,
    t_EmployeesCreateOrUpdateBodySchema,
    void
  >,
  respond: EmployeesCreateOrUpdateResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_Employee>
  | Response<201, t_Employee>
  | Response<StatusCode, t_Azure_ResourceManager_CommonTypes_ErrorResponse>
  | typeof SkipResponse
>

export type EmployeesUpdateResponder = {
  with200(): KoaRuntimeResponse<t_Employee>
  withDefault(
    status: StatusCode,
  ): KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & KoaRuntimeResponder

export type EmployeesUpdate = (
  params: Params<
    t_EmployeesUpdateParamSchema,
    t_EmployeesUpdateQuerySchema,
    t_EmployeesUpdateBodySchema,
    void
  >,
  respond: EmployeesUpdateResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_Employee>
  | Response<StatusCode, t_Azure_ResourceManager_CommonTypes_ErrorResponse>
  | typeof SkipResponse
>

export type EmployeesDeleteResponder = {
  with202(): KoaRuntimeResponse<void>
  with204(): KoaRuntimeResponse<void>
  withDefault(
    status: StatusCode,
  ): KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & KoaRuntimeResponder

export type EmployeesDelete = (
  params: Params<
    t_EmployeesDeleteParamSchema,
    t_EmployeesDeleteQuerySchema,
    void,
    void
  >,
  respond: EmployeesDeleteResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<202, void>
  | Response<204, void>
  | Response<StatusCode, t_Azure_ResourceManager_CommonTypes_ErrorResponse>
  | typeof SkipResponse
>

export type EmployeesCheckExistenceResponder = {
  with204(): KoaRuntimeResponse<void>
  with404(): KoaRuntimeResponse<void>
  withDefault(
    status: StatusCode,
  ): KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & KoaRuntimeResponder

export type EmployeesCheckExistence = (
  params: Params<
    t_EmployeesCheckExistenceParamSchema,
    t_EmployeesCheckExistenceQuerySchema,
    void,
    void
  >,
  respond: EmployeesCheckExistenceResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<204, void>
  | Response<404, void>
  | Response<StatusCode, t_Azure_ResourceManager_CommonTypes_ErrorResponse>
  | typeof SkipResponse
>

export type EmployeesListByResourceGroupResponder = {
  with200(): KoaRuntimeResponse<t_EmployeeListResult>
  withDefault(
    status: StatusCode,
  ): KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & KoaRuntimeResponder

export type EmployeesListByResourceGroup = (
  params: Params<
    t_EmployeesListByResourceGroupParamSchema,
    t_EmployeesListByResourceGroupQuerySchema,
    void,
    void
  >,
  respond: EmployeesListByResourceGroupResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_EmployeeListResult>
  | Response<StatusCode, t_Azure_ResourceManager_CommonTypes_ErrorResponse>
  | typeof SkipResponse
>

export type EmployeesListBySubscriptionResponder = {
  with200(): KoaRuntimeResponse<t_EmployeeListResult>
  withDefault(
    status: StatusCode,
  ): KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & KoaRuntimeResponder

export type EmployeesListBySubscription = (
  params: Params<
    t_EmployeesListBySubscriptionParamSchema,
    t_EmployeesListBySubscriptionQuerySchema,
    void,
    void
  >,
  respond: EmployeesListBySubscriptionResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_EmployeeListResult>
  | Response<StatusCode, t_Azure_ResourceManager_CommonTypes_ErrorResponse>
  | typeof SkipResponse
>

export type EmployeesMoveResponder = {
  with200(): KoaRuntimeResponse<t_MoveResponse>
  withDefault(
    status: StatusCode,
  ): KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & KoaRuntimeResponder

export type EmployeesMove = (
  params: Params<
    t_EmployeesMoveParamSchema,
    t_EmployeesMoveQuerySchema,
    t_EmployeesMoveBodySchema,
    void
  >,
  respond: EmployeesMoveResponder,
  ctx: RouterContext,
  next: Next,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_MoveResponse>
  | Response<StatusCode, t_Azure_ResourceManager_CommonTypes_ErrorResponse>
  | typeof SkipResponse
>

export type Implementation = {
  operationsList: OperationsList
  employeesGet: EmployeesGet
  employeesCreateOrUpdate: EmployeesCreateOrUpdate
  employeesUpdate: EmployeesUpdate
  employeesDelete: EmployeesDelete
  employeesCheckExistence: EmployeesCheckExistence
  employeesListByResourceGroup: EmployeesListByResourceGroup
  employeesListBySubscription: EmployeesListBySubscription
  employeesMove: EmployeesMove
}

export function createRouter(implementation: Implementation): KoaRouter {
  const router = new KoaRouter()

  const operationsListQuerySchema = z.object({"api-version": z.string().min(1)})

  const operationsListResponseValidator = responseValidationFactory(
    [["200", s_OperationListResult]],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  router.get(
    "operationsList",
    "/providers/Microsoft.ContosoProviderHub/operations",
    async (ctx, next) => {
      const input = {
        params: undefined,
        query: parseRequestInput(
          operationsListQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: undefined,
        headers: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_OperationListResult>(200)
        },
        withDefault(status: StatusCode) {
          return new KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
            status,
          )
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .operationsList(input, responder, ctx, next)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      // escape hatch to allow responses to be sent by the implementation handler
      if (response === SkipResponse) {
        return
      }

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = operationsListResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const employeesGetParamSchema = z.object({
    subscriptionId: s_Azure_Core_uuid,
    resourceGroupName: z
      .string()
      .min(1)
      .max(90)
      .regex(new RegExp("^[-\\w\\._\\(\\)]+$")),
    employeeName: z.string().regex(new RegExp("^[a-zA-Z0-9-]{3,24}$")),
  })

  const employeesGetQuerySchema = z.object({"api-version": z.string().min(1)})

  const employeesGetResponseValidator = responseValidationFactory(
    [["200", s_Employee]],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  router.get(
    "employeesGet",
    "/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          employeesGetParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: parseRequestInput(
          employeesGetQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: undefined,
        headers: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_Employee>(200)
        },
        withDefault(status: StatusCode) {
          return new KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
            status,
          )
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .employeesGet(input, responder, ctx, next)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      // escape hatch to allow responses to be sent by the implementation handler
      if (response === SkipResponse) {
        return
      }

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = employeesGetResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const employeesCreateOrUpdateParamSchema = z.object({
    subscriptionId: s_Azure_Core_uuid,
    resourceGroupName: z
      .string()
      .min(1)
      .max(90)
      .regex(new RegExp("^[-\\w\\._\\(\\)]+$")),
    employeeName: z.string().regex(new RegExp("^[a-zA-Z0-9-]{3,24}$")),
  })

  const employeesCreateOrUpdateQuerySchema = z.object({
    "api-version": z.string().min(1),
  })

  const employeesCreateOrUpdateBodySchema = s_Employee

  const employeesCreateOrUpdateResponseValidator = responseValidationFactory(
    [
      ["200", s_Employee],
      ["201", s_Employee],
    ],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  router.put(
    "employeesCreateOrUpdate",
    "/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          employeesCreateOrUpdateParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: parseRequestInput(
          employeesCreateOrUpdateQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: parseRequestInput(
          employeesCreateOrUpdateBodySchema,
          Reflect.get(ctx.request, "body"),
          RequestInputType.RequestBody,
        ),
        headers: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_Employee>(200)
        },
        with201() {
          return new KoaRuntimeResponse<t_Employee>(201)
        },
        withDefault(status: StatusCode) {
          return new KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
            status,
          )
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .employeesCreateOrUpdate(input, responder, ctx, next)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      // escape hatch to allow responses to be sent by the implementation handler
      if (response === SkipResponse) {
        return
      }

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = employeesCreateOrUpdateResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const employeesUpdateParamSchema = z.object({
    subscriptionId: s_Azure_Core_uuid,
    resourceGroupName: z
      .string()
      .min(1)
      .max(90)
      .regex(new RegExp("^[-\\w\\._\\(\\)]+$")),
    employeeName: z.string().regex(new RegExp("^[a-zA-Z0-9-]{3,24}$")),
  })

  const employeesUpdateQuerySchema = z.object({
    "api-version": z.string().min(1),
  })

  const employeesUpdateBodySchema = s_EmployeeUpdate

  const employeesUpdateResponseValidator = responseValidationFactory(
    [["200", s_Employee]],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  router.patch(
    "employeesUpdate",
    "/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          employeesUpdateParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: parseRequestInput(
          employeesUpdateQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: parseRequestInput(
          employeesUpdateBodySchema,
          Reflect.get(ctx.request, "body"),
          RequestInputType.RequestBody,
        ),
        headers: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_Employee>(200)
        },
        withDefault(status: StatusCode) {
          return new KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
            status,
          )
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .employeesUpdate(input, responder, ctx, next)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      // escape hatch to allow responses to be sent by the implementation handler
      if (response === SkipResponse) {
        return
      }

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = employeesUpdateResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const employeesDeleteParamSchema = z.object({
    subscriptionId: s_Azure_Core_uuid,
    resourceGroupName: z
      .string()
      .min(1)
      .max(90)
      .regex(new RegExp("^[-\\w\\._\\(\\)]+$")),
    employeeName: z.string().regex(new RegExp("^[a-zA-Z0-9-]{3,24}$")),
  })

  const employeesDeleteQuerySchema = z.object({
    "api-version": z.string().min(1),
  })

  const employeesDeleteResponseValidator = responseValidationFactory(
    [
      ["202", z.undefined()],
      ["204", z.undefined()],
    ],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  router.delete(
    "employeesDelete",
    "/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          employeesDeleteParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: parseRequestInput(
          employeesDeleteQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: undefined,
        headers: undefined,
      }

      const responder = {
        with202() {
          return new KoaRuntimeResponse<void>(202)
        },
        with204() {
          return new KoaRuntimeResponse<void>(204)
        },
        withDefault(status: StatusCode) {
          return new KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
            status,
          )
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .employeesDelete(input, responder, ctx, next)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      // escape hatch to allow responses to be sent by the implementation handler
      if (response === SkipResponse) {
        return
      }

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = employeesDeleteResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const employeesCheckExistenceParamSchema = z.object({
    subscriptionId: s_Azure_Core_uuid,
    resourceGroupName: z
      .string()
      .min(1)
      .max(90)
      .regex(new RegExp("^[-\\w\\._\\(\\)]+$")),
    employeeName: z.string().regex(new RegExp("^[a-zA-Z0-9-]{3,24}$")),
  })

  const employeesCheckExistenceQuerySchema = z.object({
    "api-version": z.string().min(1),
  })

  const employeesCheckExistenceResponseValidator = responseValidationFactory(
    [
      ["204", z.undefined()],
      ["404", z.undefined()],
    ],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  router.head(
    "employeesCheckExistence",
    "/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          employeesCheckExistenceParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: parseRequestInput(
          employeesCheckExistenceQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: undefined,
        headers: undefined,
      }

      const responder = {
        with204() {
          return new KoaRuntimeResponse<void>(204)
        },
        with404() {
          return new KoaRuntimeResponse<void>(404)
        },
        withDefault(status: StatusCode) {
          return new KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
            status,
          )
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .employeesCheckExistence(input, responder, ctx, next)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      // escape hatch to allow responses to be sent by the implementation handler
      if (response === SkipResponse) {
        return
      }

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = employeesCheckExistenceResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const employeesListByResourceGroupParamSchema = z.object({
    subscriptionId: s_Azure_Core_uuid,
    resourceGroupName: z
      .string()
      .min(1)
      .max(90)
      .regex(new RegExp("^[-\\w\\._\\(\\)]+$")),
  })

  const employeesListByResourceGroupQuerySchema = z.object({
    "api-version": z.string().min(1),
  })

  const employeesListByResourceGroupResponseValidator =
    responseValidationFactory(
      [["200", s_EmployeeListResult]],
      s_Azure_ResourceManager_CommonTypes_ErrorResponse,
    )

  router.get(
    "employeesListByResourceGroup",
    "/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          employeesListByResourceGroupParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: parseRequestInput(
          employeesListByResourceGroupQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: undefined,
        headers: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_EmployeeListResult>(200)
        },
        withDefault(status: StatusCode) {
          return new KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
            status,
          )
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .employeesListByResourceGroup(input, responder, ctx, next)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      // escape hatch to allow responses to be sent by the implementation handler
      if (response === SkipResponse) {
        return
      }

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = employeesListByResourceGroupResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const employeesListBySubscriptionParamSchema = z.object({
    subscriptionId: s_Azure_Core_uuid,
  })

  const employeesListBySubscriptionQuerySchema = z.object({
    "api-version": z.string().min(1),
  })

  const employeesListBySubscriptionResponseValidator =
    responseValidationFactory(
      [["200", s_EmployeeListResult]],
      s_Azure_ResourceManager_CommonTypes_ErrorResponse,
    )

  router.get(
    "employeesListBySubscription",
    "/subscriptions/:subscriptionId/providers/Microsoft.ContosoProviderHub/employees",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          employeesListBySubscriptionParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: parseRequestInput(
          employeesListBySubscriptionQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: undefined,
        headers: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_EmployeeListResult>(200)
        },
        withDefault(status: StatusCode) {
          return new KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
            status,
          )
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .employeesListBySubscription(input, responder, ctx, next)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      // escape hatch to allow responses to be sent by the implementation handler
      if (response === SkipResponse) {
        return
      }

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = employeesListBySubscriptionResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const employeesMoveParamSchema = z.object({
    subscriptionId: s_Azure_Core_uuid,
    resourceGroupName: z
      .string()
      .min(1)
      .max(90)
      .regex(new RegExp("^[-\\w\\._\\(\\)]+$")),
    employeeName: z.string().regex(new RegExp("^[a-zA-Z0-9-]{3,24}$")),
  })

  const employeesMoveQuerySchema = z.object({"api-version": z.string().min(1)})

  const employeesMoveBodySchema = s_MoveRequest

  const employeesMoveResponseValidator = responseValidationFactory(
    [["200", s_MoveResponse]],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  router.post(
    "employeesMove",
    "/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName/move",
    async (ctx, next) => {
      const input = {
        params: parseRequestInput(
          employeesMoveParamSchema,
          ctx.params,
          RequestInputType.RouteParam,
        ),
        query: parseRequestInput(
          employeesMoveQuerySchema,
          ctx.query,
          RequestInputType.QueryString,
        ),
        body: parseRequestInput(
          employeesMoveBodySchema,
          Reflect.get(ctx.request, "body"),
          RequestInputType.RequestBody,
        ),
        headers: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_MoveResponse>(200)
        },
        withDefault(status: StatusCode) {
          return new KoaRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
            status,
          )
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .employeesMove(input, responder, ctx, next)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      // escape hatch to allow responses to be sent by the implementation handler
      if (response === SkipResponse) {
        return
      }

      const {status, body} =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = employeesMoveResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  return router
}

export async function bootstrap(config: ServerConfig) {
  // ContosoProviderHubClient
  return startServer(config)
}
