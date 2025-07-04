/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {z} from "zod"

export const PermissiveBoolean = z.preprocess((value) => {
  if (typeof value === "string" && (value === "true" || value === "false")) {
    return value === "true"
  } else if (typeof value === "number" && (value === 1 || value === 0)) {
    return value === 1
  }
  return value
}, z.boolean())

export const s_Enumerations = z.object({
  colors: z.enum(["red", "green", "blue"]),
  starRatings: z.union([z.literal(1), z.literal(2), z.literal(3)]),
})

export const s_RandomNumber = z.object({
  result: z.coerce.number().optional(),
  params: z
    .object({
      min: z.coerce.number().optional(),
      max: z.coerce.number().optional(),
      forbidden: z.array(z.coerce.number()).optional(),
    })
    .optional(),
})

export const s_getHeadersUndeclaredJson200Response = z.object({
  rawHeaders: z.unknown().optional(),
  typedHeaders: z.unknown().optional(),
})

export const s_getHeadersRequestJson200Response = z.object({
  rawHeaders: z.unknown().optional(),
  typedHeaders: z.unknown().optional(),
})
