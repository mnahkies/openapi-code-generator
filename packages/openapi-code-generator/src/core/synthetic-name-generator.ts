import type {InputConfig} from "./input"
import {mediaTypeToIdentifier, upperFirst} from "./utils"

/**
 * During code generation, we occasionally need to generate names for entities
 * (varies depending on how the input specification is written)
 *
 * This interface allows each individual template to customize the name generation,
 * and in future will be exposed to the user to provide their own implementation and
 * further customize the output to their tastes.
 */
export interface SyntheticNameGenerator {
  forPathParameters(ctx: {operationId: string}): string

  forQueryParameters(ctx: {operationId: string}): string

  forRequestHeaders(ctx: {operationId: string}): string

  forRequestBody(ctx: {
    operationId: string
    mediaType: string
    hasMultipleMediaTypes: boolean
    config: InputConfig
  }): string

  forResponseBody(ctx: {
    operationId: string
    statusCode: number | string | undefined
    mediaType: string
    hasMultipleMediaTypes: boolean
    config: InputConfig
  }): string
}

function forPathParameters(ctx: {operationId: string}) {
  return upperFirst(`${ctx.operationId}ParamSchema`)
}

function forQueryParameters(ctx: {operationId: string}) {
  return upperFirst(`${ctx.operationId}QuerySchema`)
}

function forRequestHeaders(ctx: {operationId: string}) {
  return upperFirst(`${ctx.operationId}RequestHeaderSchema`)
}

export const legacySyntheticNameGenerator = {
  forPathParameters,
  forQueryParameters,
  forRequestHeaders,
  forRequestBody(ctx) {
    return `${ctx.operationId}${mediaTypeToIdentifier(ctx.mediaType)}RequestBody`
  },
  forResponseBody(ctx) {
    return `${ctx.operationId}${mediaTypeToIdentifier(ctx.mediaType)}${ctx.statusCode ?? ""}Response`
  },
} satisfies SyntheticNameGenerator

export const defaultSyntheticNameGenerator = {
  forPathParameters,
  forQueryParameters,
  forRequestHeaders,
  forRequestBody(ctx) {
    return `${upperFirst(ctx.operationId)}${ctx.hasMultipleMediaTypes ? mediaTypeToIdentifier(ctx.mediaType) : ""}RequestBody`
  },
  forResponseBody(ctx) {
    return `${upperFirst(ctx.operationId)}${ctx.hasMultipleMediaTypes ? mediaTypeToIdentifier(ctx.mediaType) : ""}${ctx.statusCode ?? ""}Response`
  },
} satisfies SyntheticNameGenerator
