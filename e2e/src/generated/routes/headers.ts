/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {
  t_getHeadersRequestJson200Response,
  t_getHeadersUndeclaredJson200Response,
} from "../models"
import {
  s_getHeadersRequestJson200Response,
  s_getHeadersUndeclaredJson200Response,
} from "../schemas"
import KoaRouter, { RouterContext } from "@koa/router"
import { KoaRuntimeError } from "@nahkies/typescript-koa-runtime/errors"
import {
  KoaRuntimeResponder,
  KoaRuntimeResponse,
  Response,
  StatusCode,
} from "@nahkies/typescript-koa-runtime/server"
import {
  Params,
  responseValidationFactory,
} from "@nahkies/typescript-koa-runtime/zod"

export type GetHeadersUndeclaredResponder = {
  with200(): KoaRuntimeResponse<t_getHeadersUndeclaredJson200Response>
} & KoaRuntimeResponder

export type GetHeadersUndeclared = (
  params: Params<void, void, void>,
  respond: GetHeadersUndeclaredResponder,
  ctx: RouterContext,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_getHeadersUndeclaredJson200Response>
>

export type GetHeadersRequestResponder = {
  with200(): KoaRuntimeResponse<t_getHeadersRequestJson200Response>
} & KoaRuntimeResponder

export type GetHeadersRequest = (
  params: Params<void, void, void>,
  respond: GetHeadersRequestResponder,
  ctx: RouterContext,
) => Promise<
  | KoaRuntimeResponse<unknown>
  | Response<200, t_getHeadersRequestJson200Response>
>

export type Implementation = {
  getHeadersUndeclared: GetHeadersUndeclared
  getHeadersRequest: GetHeadersRequest
}

export function createRouter(implementation: Implementation): KoaRouter {
  const router = new KoaRouter()

  const getHeadersUndeclaredResponseValidator = responseValidationFactory(
    [["200", s_getHeadersUndeclaredJson200Response]],
    undefined,
  )

  router.get(
    "getHeadersUndeclared",
    "/headers/undeclared",
    async (ctx, next) => {
      const input = {
        params: undefined,
        query: undefined,
        body: undefined,
      }

      const responder = {
        with200() {
          return new KoaRuntimeResponse<t_getHeadersUndeclaredJson200Response>(
            200,
          )
        },
        withStatus(status: StatusCode) {
          return new KoaRuntimeResponse(status)
        },
      }

      const response = await implementation
        .getHeadersUndeclared(input, responder, ctx)
        .catch((err) => {
          throw KoaRuntimeError.HandlerError(err)
        })

      const { status, body } =
        response instanceof KoaRuntimeResponse ? response.unpack() : response

      ctx.body = getHeadersUndeclaredResponseValidator(status, body)
      ctx.status = status
      return next()
    },
  )

  const getHeadersRequestResponseValidator = responseValidationFactory(
    [["200", s_getHeadersRequestJson200Response]],
    undefined,
  )

  router.get("getHeadersRequest", "/headers/request", async (ctx, next) => {
    const input = {
      params: undefined,
      query: undefined,
      body: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<t_getHeadersRequestJson200Response>(200)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const response = await implementation
      .getHeadersRequest(input, responder, ctx)
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    const { status, body } =
      response instanceof KoaRuntimeResponse ? response.unpack() : response

    ctx.body = getHeadersRequestResponseValidator(status, body)
    ctx.status = status
    return next()
  })

  return router
}