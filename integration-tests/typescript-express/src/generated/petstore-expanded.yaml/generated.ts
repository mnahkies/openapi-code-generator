/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {
  t_AddPetRequestBodySchema,
  t_DeletePetParamSchema,
  t_Error,
  t_FindPetByIdParamSchema,
  t_FindPetsQuerySchema,
  t_Pet,
} from "./models"
import {s_Error, s_NewPet, s_Pet} from "./schemas"
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

export type FindPetsResponder = {
  with200(): ExpressRuntimeResponse<t_Pet[]>
  withDefault(status: StatusCode): ExpressRuntimeResponse<t_Error>
} & ExpressRuntimeResponder

export type FindPets = (
  params: Params<void, t_FindPetsQuerySchema, void, void>,
  respond: FindPetsResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type AddPetResponder = {
  with200(): ExpressRuntimeResponse<t_Pet>
  withDefault(status: StatusCode): ExpressRuntimeResponse<t_Error>
} & ExpressRuntimeResponder

export type AddPet = (
  params: Params<void, void, t_AddPetRequestBodySchema, void>,
  respond: AddPetResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type FindPetByIdResponder = {
  with200(): ExpressRuntimeResponse<t_Pet>
  withDefault(status: StatusCode): ExpressRuntimeResponse<t_Error>
} & ExpressRuntimeResponder

export type FindPetById = (
  params: Params<t_FindPetByIdParamSchema, void, void, void>,
  respond: FindPetByIdResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type DeletePetResponder = {
  with204(): ExpressRuntimeResponse<void>
  withDefault(status: StatusCode): ExpressRuntimeResponse<t_Error>
} & ExpressRuntimeResponder

export type DeletePet = (
  params: Params<t_DeletePetParamSchema, void, void, void>,
  respond: DeletePetResponder,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>

export type Implementation = {
  findPets: FindPets
  addPet: AddPet
  findPetById: FindPetById
  deletePet: DeletePet
}

export function createRouter(implementation: Implementation): Router {
  const router = Router()

  const findPetsQuerySchema = z.object({
    tags: z
      .preprocess(
        (it: unknown) => (Array.isArray(it) || it === undefined ? it : [it]),
        z.array(z.string()),
      )
      .optional(),
    limit: z.coerce.number().optional(),
  })

  const findPetsResponseBodyValidator = responseValidationFactory(
    [["200", z.array(s_Pet)]],
    s_Error,
  )

  // findPets
  router.get(
    `/pets`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: undefined,
          query: parseRequestInput(
            findPetsQuerySchema,
            req.query,
            RequestInputType.QueryString,
          ),
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_Pet[]>(200)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Error>(status)
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .findPets(input, responder, req, res, next)
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
          res.json(findPetsResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
    },
  )

  const addPetRequestBodySchema = s_NewPet

  const addPetResponseBodyValidator = responseValidationFactory(
    [["200", s_Pet]],
    s_Error,
  )

  // addPet
  router.post(
    `/pets`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: undefined,
          query: undefined,
          body: parseRequestInput(
            addPetRequestBodySchema,
            req.body,
            RequestInputType.RequestBody,
          ),
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_Pet>(200)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Error>(status)
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .addPet(input, responder, req, res, next)
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
          res.json(addPetResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
    },
  )

  const findPetByIdParamSchema = z.object({id: z.coerce.number()})

  const findPetByIdResponseBodyValidator = responseValidationFactory(
    [["200", s_Pet]],
    s_Error,
  )

  // findPetById
  router.get(
    `/pets/:id`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: parseRequestInput(
            findPetByIdParamSchema,
            req.params,
            RequestInputType.RouteParam,
          ),
          query: undefined,
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with200() {
            return new ExpressRuntimeResponse<t_Pet>(200)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Error>(status)
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .findPetById(input, responder, req, res, next)
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
          res.json(findPetByIdResponseBodyValidator(status, body))
        } else {
          res.end()
        }
      } catch (error) {
        next(error)
      }
    },
  )

  const deletePetParamSchema = z.object({id: z.coerce.number()})

  const deletePetResponseBodyValidator = responseValidationFactory(
    [["204", z.undefined()]],
    s_Error,
  )

  // deletePet
  router.delete(
    `/pets/:id`,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = {
          params: parseRequestInput(
            deletePetParamSchema,
            req.params,
            RequestInputType.RouteParam,
          ),
          query: undefined,
          body: undefined,
          headers: undefined,
        }

        const responder = {
          with204() {
            return new ExpressRuntimeResponse<void>(204)
          },
          withDefault(status: StatusCode) {
            return new ExpressRuntimeResponse<t_Error>(status)
          },
          withStatus(status: StatusCode) {
            return new ExpressRuntimeResponse(status)
          },
        }

        const response = await implementation
          .deletePet(input, responder, req, res, next)
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
          res.json(deletePetResponseBodyValidator(status, body))
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
  // Swagger Petstore
  return startServer(config)
}
