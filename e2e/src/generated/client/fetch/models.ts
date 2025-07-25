/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

export type UnknownEnumNumberValue = number & {
  _brand: "unknown enum number value"
}

export type UnknownEnumStringValue = string & {
  _brand: "unknown enum string value"
}

export type t_Enumerations = {
  colors: "red" | "green" | "blue" | UnknownEnumStringValue
  starRatings: 1 | 2 | 3 | UnknownEnumNumberValue
}

export type t_ProductOrder = {
  address?:
    | {
        address1?: string | undefined
        postcode?: string | undefined
      }
    | undefined
  quantity?: number | undefined
  sku?: string | undefined
}

export type t_RandomNumber = {
  params?:
    | {
        forbidden?: number[] | undefined
        max?: number | undefined
        min?: number | undefined
      }
    | undefined
  result?: number | undefined
}

export type t_getHeadersRequestJson200Response = {
  rawHeaders?: unknown | undefined
  typedHeaders?: unknown | undefined
}

export type t_getHeadersUndeclaredJson200Response = {
  rawHeaders?: unknown | undefined
  typedHeaders?: unknown | undefined
}

export type t_postValidationOptionalBodyJson200Response = {
  id?: string | undefined
}

export type t_postValidationOptionalBodyJsonRequestBody = {
  id?: string | undefined
}
