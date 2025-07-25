/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {
  t_Azure_ResourceManager_CommonTypes_ErrorResponse,
  t_Employee,
  t_EmployeeListResult,
  t_EmployeesCheckExistenceParamSchema,
  t_EmployeesCheckExistenceQuerySchema,
  t_EmployeesCreateOrUpdateParamSchema,
  t_EmployeesCreateOrUpdateQuerySchema,
  t_EmployeesCreateOrUpdateRequestBodySchema,
  t_EmployeesDeleteParamSchema,
  t_EmployeesDeleteQuerySchema,
  t_EmployeesGetParamSchema,
  t_EmployeesGetQuerySchema,
  t_EmployeesListByResourceGroupParamSchema,
  t_EmployeesListByResourceGroupQuerySchema,
  t_EmployeesListBySubscriptionParamSchema,
  t_EmployeesListBySubscriptionQuerySchema,
  t_EmployeesMoveParamSchema,
  t_EmployeesMoveQuerySchema,
  t_EmployeesMoveRequestBodySchema,
  t_EmployeesUpdateParamSchema,
  t_EmployeesUpdateQuerySchema,
  t_EmployeesUpdateRequestBodySchema,
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
import {
  ExpressRuntimeError,
  RequestInputType,
} from "@nahkies/typescript-express-runtime/errors"
import {
  ExpressRuntimeResponder,
  ExpressRuntimeResponse,
  Params,
  ServerConfig,
  SkipResponse,
  StatusCode,
  startServer,
} from "@nahkies/typescript-express-runtime/server"
import {
  parseRequestInput,
  responseValidationFactory,
} from "@nahkies/typescript-express-runtime/zod"
import {NextFunction, Request, Response, Router} from "express"
import {z} from "zod"

export type OperationsListResponder = {
  with200(): ExpressRuntimeResponse<t_OperationListResult>
  withDefault(
    status: StatusCode,
  ): ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & ExpressRuntimeResponder

export type OperationsList = (
  params: Params<void, t_OperationsListQuerySchema, void, void>,
  respond: OperationsListResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type EmployeesGetResponder = {
  with200(): ExpressRuntimeResponse<t_Employee>
  withDefault(
    status: StatusCode,
  ): ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & ExpressRuntimeResponder

export type EmployeesGet = (
  params: Params<
    t_EmployeesGetParamSchema,
    t_EmployeesGetQuerySchema,
    void,
    void
  >,
  respond: EmployeesGetResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type EmployeesCreateOrUpdateResponder = {
  with200(): ExpressRuntimeResponse<t_Employee>
  with201(): ExpressRuntimeResponse<t_Employee>
  withDefault(
    status: StatusCode,
  ): ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & ExpressRuntimeResponder

export type EmployeesCreateOrUpdate = (
  params: Params<
    t_EmployeesCreateOrUpdateParamSchema,
    t_EmployeesCreateOrUpdateQuerySchema,
    t_EmployeesCreateOrUpdateRequestBodySchema,
    void
  >,
  respond: EmployeesCreateOrUpdateResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type EmployeesUpdateResponder = {
  with200(): ExpressRuntimeResponse<t_Employee>
  withDefault(
    status: StatusCode,
  ): ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & ExpressRuntimeResponder

export type EmployeesUpdate = (
  params: Params<
    t_EmployeesUpdateParamSchema,
    t_EmployeesUpdateQuerySchema,
    t_EmployeesUpdateRequestBodySchema,
    void
  >,
  respond: EmployeesUpdateResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type EmployeesDeleteResponder = {
  with202(): ExpressRuntimeResponse<void>
  with204(): ExpressRuntimeResponse<void>
  withDefault(
    status: StatusCode,
  ): ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & ExpressRuntimeResponder

export type EmployeesDelete = (
  params: Params<
    t_EmployeesDeleteParamSchema,
    t_EmployeesDeleteQuerySchema,
    void,
    void
  >,
  respond: EmployeesDeleteResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type EmployeesCheckExistenceResponder = {
  with204(): ExpressRuntimeResponse<void>
  with404(): ExpressRuntimeResponse<void>
  withDefault(
    status: StatusCode,
  ): ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & ExpressRuntimeResponder

export type EmployeesCheckExistence = (
  params: Params<
    t_EmployeesCheckExistenceParamSchema,
    t_EmployeesCheckExistenceQuerySchema,
    void,
    void
  >,
  respond: EmployeesCheckExistenceResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type EmployeesListByResourceGroupResponder = {
  with200(): ExpressRuntimeResponse<t_EmployeeListResult>
  withDefault(
    status: StatusCode,
  ): ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & ExpressRuntimeResponder

export type EmployeesListByResourceGroup = (
  params: Params<
    t_EmployeesListByResourceGroupParamSchema,
    t_EmployeesListByResourceGroupQuerySchema,
    void,
    void
  >,
  respond: EmployeesListByResourceGroupResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type EmployeesListBySubscriptionResponder = {
  with200(): ExpressRuntimeResponse<t_EmployeeListResult>
  withDefault(
    status: StatusCode,
  ): ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & ExpressRuntimeResponder

export type EmployeesListBySubscription = (
  params: Params<
    t_EmployeesListBySubscriptionParamSchema,
    t_EmployeesListBySubscriptionQuerySchema,
    void,
    void
  >,
  respond: EmployeesListBySubscriptionResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type EmployeesMoveResponder = {
  with200(): ExpressRuntimeResponse<t_MoveResponse>
  withDefault(
    status: StatusCode,
  ): ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>
} & ExpressRuntimeResponder

export type EmployeesMove = (
  params: Params<
    t_EmployeesMoveParamSchema,
    t_EmployeesMoveQuerySchema,
    t_EmployeesMoveRequestBodySchema,
    void
  >,
  respond: EmployeesMoveResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

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

export function createRouter(implementation: Implementation): Router {
  const router = Router()

  const operationsListQuerySchema = z.object({"api-version": z.string().min(1)})

  const operationsListResponseBodyValidator = responseValidationFactory(
    [["200", s_OperationListResult]],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  // operationsList
  router.get(
    `/providers/Microsoft.ContosoProviderHub/operations`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: undefined,
          query: parseRequestInput(
            operationsListQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_OperationListResult>(200)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
              status,
            )
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .operationsList(input, responder, req, res, next)
          .catch((err) => {
            throw ExpressRuntimeError.HandlerError(err)
          })

        // escape hatch to allow responses to be sent by the implementation handler
        if (response === SkipResponse) {
          return
        }

        const {status, body} =
          response instanceof ExpressRuntimeResponse
            ? response.unpack()
            : response

        res.status(status)

        if (body !== undefined) {
          res.json(operationsListResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
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

  const employeesGetResponseBodyValidator = responseValidationFactory(
    [["200", s_Employee]],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  // employeesGet
  router.get(
    `/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: parseRequestInput(
            employeesGetParamSchema,
            req.params,
            RequestInputType.RouteParam,
          ),
          query: parseRequestInput(
            employeesGetQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_Employee>(200)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
              status,
            )
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .employeesGet(input, responder, req, res, next)
          .catch((err) => {
            throw ExpressRuntimeError.HandlerError(err)
          })

        // escape hatch to allow responses to be sent by the implementation handler
        if (response === SkipResponse) {
          return
        }

        const {status, body} =
          response instanceof ExpressRuntimeResponse
            ? response.unpack()
            : response

        res.status(status)

        if (body !== undefined) {
          res.json(employeesGetResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
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

  const employeesCreateOrUpdateRequestBodySchema = s_Employee

  const employeesCreateOrUpdateResponseBodyValidator =
    responseValidationFactory(
      [
        ["200", s_Employee],
        ["201", s_Employee],
      ],
      s_Azure_ResourceManager_CommonTypes_ErrorResponse,
    )

  // employeesCreateOrUpdate
  router.put(
    `/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: parseRequestInput(
            employeesCreateOrUpdateParamSchema,
            req.params,
            RequestInputType.RouteParam,
          ),
          query: parseRequestInput(
            employeesCreateOrUpdateQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: parseRequestInput(
            employeesCreateOrUpdateRequestBodySchema,
            req.body,
            RequestInputType.RequestBody,
          ),
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_Employee>(200)
          },
          with201() {
            return new ExpressRuntimeResponse<t_Employee>(201)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
              status,
            )
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .employeesCreateOrUpdate(input, responder, req, res, next)
          .catch((err) => {
            throw ExpressRuntimeError.HandlerError(err)
          })

        // escape hatch to allow responses to be sent by the implementation handler
        if (response === SkipResponse) {
          return
        }

        const {status, body} =
          response instanceof ExpressRuntimeResponse
            ? response.unpack()
            : response

        res.status(status)

        if (body !== undefined) {
          res.json(employeesCreateOrUpdateResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
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

  const employeesUpdateRequestBodySchema = s_EmployeeUpdate

  const employeesUpdateResponseBodyValidator = responseValidationFactory(
    [["200", s_Employee]],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  // employeesUpdate
  router.patch(
    `/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: parseRequestInput(
            employeesUpdateParamSchema,
            req.params,
            RequestInputType.RouteParam,
          ),
          query: parseRequestInput(
            employeesUpdateQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: parseRequestInput(
            employeesUpdateRequestBodySchema,
            req.body,
            RequestInputType.RequestBody,
          ),
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_Employee>(200)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
              status,
            )
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .employeesUpdate(input, responder, req, res, next)
          .catch((err) => {
            throw ExpressRuntimeError.HandlerError(err)
          })

        // escape hatch to allow responses to be sent by the implementation handler
        if (response === SkipResponse) {
          return
        }

        const {status, body} =
          response instanceof ExpressRuntimeResponse
            ? response.unpack()
            : response

        res.status(status)

        if (body !== undefined) {
          res.json(employeesUpdateResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
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

  const employeesDeleteResponseBodyValidator = responseValidationFactory(
    [
      ["202", z.undefined()],
      ["204", z.undefined()],
    ],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  // employeesDelete
  router.delete(
    `/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: parseRequestInput(
            employeesDeleteParamSchema,
            req.params,
            RequestInputType.RouteParam,
          ),
          query: parseRequestInput(
            employeesDeleteQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with202() {
            return new ExpressRuntimeResponse<void>(202)
          },
          with204() {
            return new ExpressRuntimeResponse<void>(204)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
              status,
            )
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .employeesDelete(input, responder, req, res, next)
          .catch((err) => {
            throw ExpressRuntimeError.HandlerError(err)
          })

        // escape hatch to allow responses to be sent by the implementation handler
        if (response === SkipResponse) {
          return
        }

        const {status, body} =
          response instanceof ExpressRuntimeResponse
            ? response.unpack()
            : response

        res.status(status)

        if (body !== undefined) {
          res.json(employeesDeleteResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
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

  const employeesCheckExistenceResponseBodyValidator =
    responseValidationFactory(
      [
        ["204", z.undefined()],
        ["404", z.undefined()],
      ],
      s_Azure_ResourceManager_CommonTypes_ErrorResponse,
    )

  // employeesCheckExistence
  router.head(
    `/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: parseRequestInput(
            employeesCheckExistenceParamSchema,
            req.params,
            RequestInputType.RouteParam,
          ),
          query: parseRequestInput(
            employeesCheckExistenceQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with204() {
            return new ExpressRuntimeResponse<void>(204)
          },
          with404() {
            return new ExpressRuntimeResponse<void>(404)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
              status,
            )
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .employeesCheckExistence(input, responder, req, res, next)
          .catch((err) => {
            throw ExpressRuntimeError.HandlerError(err)
          })

        // escape hatch to allow responses to be sent by the implementation handler
        if (response === SkipResponse) {
          return
        }

        const {status, body} =
          response instanceof ExpressRuntimeResponse
            ? response.unpack()
            : response

        res.status(status)

        if (body !== undefined) {
          res.json(employeesCheckExistenceResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
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

  const employeesListByResourceGroupResponseBodyValidator =
    responseValidationFactory(
      [["200", s_EmployeeListResult]],
      s_Azure_ResourceManager_CommonTypes_ErrorResponse,
    )

  // employeesListByResourceGroup
  router.get(
    `/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: parseRequestInput(
            employeesListByResourceGroupParamSchema,
            req.params,
            RequestInputType.RouteParam,
          ),
          query: parseRequestInput(
            employeesListByResourceGroupQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_EmployeeListResult>(200)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
              status,
            )
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .employeesListByResourceGroup(input, responder, req, res, next)
          .catch((err) => {
            throw ExpressRuntimeError.HandlerError(err)
          })

        // escape hatch to allow responses to be sent by the implementation handler
        if (response === SkipResponse) {
          return
        }

        const {status, body} =
          response instanceof ExpressRuntimeResponse
            ? response.unpack()
            : response

        res.status(status)

        if (body !== undefined) {
          res.json(
            employeesListByResourceGroupResponseBodyValidator(status, body),
          )
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
    },
  )

  const employeesListBySubscriptionParamSchema = z.object({
    subscriptionId: s_Azure_Core_uuid,
  })

  const employeesListBySubscriptionQuerySchema = z.object({
    "api-version": z.string().min(1),
  })

  const employeesListBySubscriptionResponseBodyValidator =
    responseValidationFactory(
      [["200", s_EmployeeListResult]],
      s_Azure_ResourceManager_CommonTypes_ErrorResponse,
    )

  // employeesListBySubscription
  router.get(
    `/subscriptions/:subscriptionId/providers/Microsoft.ContosoProviderHub/employees`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: parseRequestInput(
            employeesListBySubscriptionParamSchema,
            req.params,
            RequestInputType.RouteParam,
          ),
          query: parseRequestInput(
            employeesListBySubscriptionQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_EmployeeListResult>(200)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
              status,
            )
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .employeesListBySubscription(input, responder, req, res, next)
          .catch((err) => {
            throw ExpressRuntimeError.HandlerError(err)
          })

        // escape hatch to allow responses to be sent by the implementation handler
        if (response === SkipResponse) {
          return
        }

        const {status, body} =
          response instanceof ExpressRuntimeResponse
            ? response.unpack()
            : response

        res.status(status)

        if (body !== undefined) {
          res.json(
            employeesListBySubscriptionResponseBodyValidator(status, body),
          )
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
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

  const employeesMoveRequestBodySchema = s_MoveRequest

  const employeesMoveResponseBodyValidator = responseValidationFactory(
    [["200", s_MoveResponse]],
    s_Azure_ResourceManager_CommonTypes_ErrorResponse,
  )

  // employeesMove
  router.post(
    `/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.ContosoProviderHub/employees/:employeeName/move`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: parseRequestInput(
            employeesMoveParamSchema,
            req.params,
            RequestInputType.RouteParam,
          ),
          query: parseRequestInput(
            employeesMoveQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: parseRequestInput(
            employeesMoveRequestBodySchema,
            req.body,
            RequestInputType.RequestBody,
          ),
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_MoveResponse>(200)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Azure_ResourceManager_CommonTypes_ErrorResponse>(
              status,
            )
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .employeesMove(input, responder, req, res, next)
          .catch((err) => {
            throw ExpressRuntimeError.HandlerError(err)
          })

        // escape hatch to allow responses to be sent by the implementation handler
        if (response === SkipResponse) {
          return
        }

        const {status, body} =
          response instanceof ExpressRuntimeResponse
            ? response.unpack()
            : response

        res.status(status)

        if (body !== undefined) {
          res.json(employeesMoveResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}

export async function bootstrap(config: ServerConfig) {
  // ContosoProviderHubClient
  return startServer(config)
}
