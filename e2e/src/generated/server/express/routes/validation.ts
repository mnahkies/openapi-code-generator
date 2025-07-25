/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {
  t_Enumerations,
  t_GetValidationNumbersRandomNumberQuerySchema,
  t_PostValidationEnumsRequestBodySchema,
  t_PostValidationOptionalBodyRequestBodySchema,
  t_RandomNumber,
  t_postValidationOptionalBodyJson200Response,
} from "../models"
import {
  s_Enumerations,
  s_RandomNumber,
  s_postValidationOptionalBodyJson200Response,
  s_postValidationOptionalBodyJsonRequestBody,
} from "../schemas"
import {
  ExpressRuntimeError,
  RequestInputType,
} from "@nahkies/typescript-express-runtime/errors"
import {
  ExpressRuntimeResponder,
  ExpressRuntimeResponse,
  Params,
  SkipResponse,
  StatusCode,
} from "@nahkies/typescript-express-runtime/server"
import {
  parseRequestInput,
  responseValidationFactory,
} from "@nahkies/typescript-express-runtime/zod"
import {NextFunction, Request, Response, Router} from "express"
import {z} from "zod"

export type GetValidationNumbersRandomNumberResponder = {
  with200(): ExpressRuntimeResponse<t_RandomNumber>
} & ExpressRuntimeResponder

export type GetValidationNumbersRandomNumber = (
  params: Params<
    void,
    t_GetValidationNumbersRandomNumberQuerySchema,
    void,
    void
  >,
  respond: GetValidationNumbersRandomNumberResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type PostValidationEnumsResponder = {
  with200(): ExpressRuntimeResponse<t_Enumerations>
} & ExpressRuntimeResponder

export type PostValidationEnums = (
  params: Params<void, void, t_PostValidationEnumsRequestBodySchema, void>,
  respond: PostValidationEnumsResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type PostValidationOptionalBodyResponder = {
  with200(): ExpressRuntimeResponse<t_postValidationOptionalBodyJson200Response>
  with204(): ExpressRuntimeResponse<void>
} & ExpressRuntimeResponder

export type PostValidationOptionalBody = (
  params: Params<
    void,
    void,
    t_PostValidationOptionalBodyRequestBodySchema | undefined,
    void
  >,
  respond: PostValidationOptionalBodyResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type GetResponses500Responder = {
  with500(): ExpressRuntimeResponse<void>
} & ExpressRuntimeResponder

export type GetResponses500 = (
  params: Params<void, void, void, void>,
  respond: GetResponses500Responder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type GetResponsesEmptyResponder = {
  with204(): ExpressRuntimeResponse<void>
} & ExpressRuntimeResponder

export type GetResponsesEmpty = (
  params: Params<void, void, void, void>,
  respond: GetResponsesEmptyResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type ValidationImplementation = {
  getValidationNumbersRandomNumber: GetValidationNumbersRandomNumber
  postValidationEnums: PostValidationEnums
  postValidationOptionalBody: PostValidationOptionalBody
  getResponses500: GetResponses500
  getResponsesEmpty: GetResponsesEmpty
}

export function createValidationRouter(
  implementation: ValidationImplementation,
): Router {
  const router = Router()

  const getValidationNumbersRandomNumberQuerySchema = z.object({
    max: z.coerce.number().min(1).optional().default(10),
    min: z.coerce.number().min(0).optional().default(0),
    forbidden: z
      .preprocess(
        (it: unknown) => (Array.isArray(it) || it === undefined ? it : [it]),
        z.array(z.coerce.number()),
      )
      .optional(),
  })

  const getValidationNumbersRandomNumberResponseBodyValidator =
    responseValidationFactory([["200", s_RandomNumber]], undefined)

  // getValidationNumbersRandomNumber
  router.get(
    `/validation/numbers/random-number`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: undefined,
          query: parseRequestInput(
            getValidationNumbersRandomNumberQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_RandomNumber>(200)
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .getValidationNumbersRandomNumber(input, responder, req, res, next)
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
            getValidationNumbersRandomNumberResponseBodyValidator(status, body),
          )
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
    },
  )

  const postValidationEnumsRequestBodySchema = s_Enumerations

  const postValidationEnumsResponseBodyValidator = responseValidationFactory(
    [["200", s_Enumerations]],
    undefined,
  )

  // postValidationEnums
  router.post(
    `/validation/enums`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: undefined,
          query: undefined,
          body: parseRequestInput(
            postValidationEnumsRequestBodySchema,
            req.body,
            RequestInputType.RequestBody,
          ),
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_Enumerations>(200)
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .postValidationEnums(input, responder, req, res, next)
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
          res.json(postValidationEnumsResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
    },
  )

  const postValidationOptionalBodyRequestBodySchema =
    s_postValidationOptionalBodyJsonRequestBody.optional()

  const postValidationOptionalBodyResponseBodyValidator =
    responseValidationFactory(
      [
        ["200", s_postValidationOptionalBodyJson200Response],
        ["204", z.undefined()],
      ],
      undefined,
    )

  // postValidationOptionalBody
  router.post(
    `/validation/optional-body`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: undefined,
          query: undefined,
          body: parseRequestInput(
            postValidationOptionalBodyRequestBodySchema,
            req.body,
            RequestInputType.RequestBody,
          ),
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_postValidationOptionalBodyJson200Response>(
              200,
            )
          },
          with204() {
            return new ExpressRuntimeResponse<void>(204)
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .postValidationOptionalBody(input, responder, req, res, next)
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
            postValidationOptionalBodyResponseBodyValidator(status, body),
          )
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
    },
  )

  const getResponses500ResponseBodyValidator = responseValidationFactory(
    [["500", z.undefined()]],
    undefined,
  )

  // getResponses500
  router.get(
    `/responses/500`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: undefined,
          query: undefined,
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with500() {
            return new ExpressRuntimeResponse<void>(500)
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .getResponses500(input, responder, req, res, next)
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
          res.json(getResponses500ResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
    },
  )

  const getResponsesEmptyResponseBodyValidator = responseValidationFactory(
    [["204", z.undefined()]],
    undefined,
  )

  // getResponsesEmpty
  router.get(
    `/responses/empty`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: undefined,
          query: undefined,
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with204() {
            return new ExpressRuntimeResponse<void>(204)
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .getResponsesEmpty(input, responder, req, res, next)
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
          res.json(getResponsesEmptyResponseBodyValidator(status, body))
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

export {createValidationRouter as createRouter}
export type {ValidationImplementation as Implementation}
