/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

export type t_Azure_Core_Foundations_Error = {
  code: string
  details?: t_Azure_Core_Foundations_Error[]
  innererror?: t_Azure_Core_Foundations_InnerError
  message: string
  target?: string
}

export type t_Azure_Core_Foundations_ErrorResponse = {
  error: t_Azure_Core_Foundations_Error
}

export type t_Azure_Core_Foundations_InnerError = {
  code?: string
  innererror?: t_Azure_Core_Foundations_InnerError
}

export type t_Azure_Core_Foundations_OperationState =
  | "NotStarted"
  | "Running"
  | "Succeeded"
  | "Failed"
  | "Canceled"

export type t_Azure_Core_eTag = string

export type t_Manufacturer = {
  address: string
  readonly etag: t_Azure_Core_eTag
  readonly id: string
  name: string
}

export type t_PagedManufacturer = {
  nextLink?: string
  value: t_Manufacturer[]
}

export type t_PagedWidget = {
  nextLink?: string
  value: t_Widget[]
}

export type t_PagedWidgetPart = {
  nextLink?: string
  value: t_WidgetPart[]
}

export type t_Widget = {
  color: t_WidgetColor
  readonly etag: t_Azure_Core_eTag
  manufacturerId: string
  readonly name: string
}

export type t_WidgetAnalytics = {
  readonly id: "current"
  repairCount: number
  useCount: number
}

export type t_WidgetColor =
  | string
  | "Black"
  | "White"
  | "Red"
  | "Green"
  | "Blue"

export type t_WidgetPart = {
  readonly etag: t_Azure_Core_eTag
  manufacturerId: string
  readonly name: string
  partId: string
}

export type t_WidgetRepairRequest = {
  completedDateTime: string
  createdDateTime: string
  requestState: t_WidgetRepairState
  scheduledDateTime: string
  updatedDateTime: string
}

export type t_WidgetRepairState =
  | string
  | "Succeeded"
  | "Failed"
  | "Canceled"
  | "SentToManufacturer"

export type t_ManufacturersCreateManufacturerBodySchema = {
  address: string
  readonly etag: t_Azure_Core_eTag
  readonly id: string
  name: string
}

export type t_ManufacturersCreateManufacturerParamSchema = {
  manufacturerId: string
}

export type t_ManufacturersCreateManufacturerQuerySchema = {
  "api-version": string
}

export type t_ManufacturersDeleteManufacturerParamSchema = {
  manufacturerId: string
}

export type t_ManufacturersDeleteManufacturerQuerySchema = {
  "api-version": string
}

export type t_ManufacturersGetManufacturerParamSchema = {
  manufacturerId: string
}

export type t_ManufacturersGetManufacturerQuerySchema = {
  "api-version": string
}

export type t_ManufacturersGetManufacturerOperationStatusParamSchema = {
  manufacturerId: string
  operationId: string
}

export type t_ManufacturersGetManufacturerOperationStatusQuerySchema = {
  "api-version": string
}

export type t_ManufacturersListManufacturersQuerySchema = {
  "api-version": string
}

export type t_ServiceStatusQuerySchema = {
  "api-version": string
}

export type t_WidgetPartsCreateWidgetPartBodySchema = {
  readonly etag: t_Azure_Core_eTag
  manufacturerId: string
  readonly name: string
  partId: string
}

export type t_WidgetPartsCreateWidgetPartParamSchema = {
  widgetName: string
}

export type t_WidgetPartsCreateWidgetPartQuerySchema = {
  "api-version": string
}

export type t_WidgetPartsDeleteWidgetPartParamSchema = {
  widgetName: string
  widgetPartName: string
}

export type t_WidgetPartsDeleteWidgetPartQuerySchema = {
  "api-version": string
}

export type t_WidgetPartsGetWidgetPartParamSchema = {
  widgetName: string
  widgetPartName: string
}

export type t_WidgetPartsGetWidgetPartQuerySchema = {
  "api-version": string
}

export type t_WidgetPartsGetWidgetPartOperationStatusParamSchema = {
  operationId: string
  widgetName: string
  widgetPartName: string
}

export type t_WidgetPartsGetWidgetPartOperationStatusQuerySchema = {
  "api-version": string
}

export type t_WidgetPartsListWidgetPartsParamSchema = {
  widgetName: string
}

export type t_WidgetPartsListWidgetPartsQuerySchema = {
  "api-version": string
}

export type t_WidgetPartsReorderPartsBodySchema = {
  signedOffBy: string
}

export type t_WidgetPartsReorderPartsParamSchema = {
  widgetName: string
}

export type t_WidgetPartsReorderPartsQuerySchema = {
  "api-version": string
}

export type t_WidgetsCreateOrUpdateWidgetBodySchema = {
  color?: t_WidgetColor
  manufacturerId?: string
}

export type t_WidgetsCreateOrUpdateWidgetParamSchema = {
  widgetName: string
}

export type t_WidgetsCreateOrUpdateWidgetQuerySchema = {
  "api-version": string
}

export type t_WidgetsDeleteWidgetParamSchema = {
  widgetName: string
}

export type t_WidgetsDeleteWidgetQuerySchema = {
  "api-version": string
}

export type t_WidgetsGetAnalyticsParamSchema = {
  widgetName: string
}

export type t_WidgetsGetAnalyticsQuerySchema = {
  "api-version": string
}

export type t_WidgetsGetRepairStatusParamSchema = {
  operationId: string
  widgetId: string
}

export type t_WidgetsGetRepairStatusQuerySchema = {
  "api-version": string
}

export type t_WidgetsGetWidgetParamSchema = {
  widgetName: string
}

export type t_WidgetsGetWidgetQuerySchema = {
  "api-version": string
}

export type t_WidgetsGetWidgetOperationStatusParamSchema = {
  operationId: string
  widgetName: string
}

export type t_WidgetsGetWidgetOperationStatusQuerySchema = {
  "api-version": string
}

export type t_WidgetsListWidgetsQuerySchema = {
  "api-version": string
  maxpagesize?: number
  select?: string[]
  skip?: number
  top?: number
}

export type t_WidgetsScheduleRepairsBodySchema = {
  completedDateTime: string
  createdDateTime: string
  requestState: t_WidgetRepairState
  scheduledDateTime: string
  updatedDateTime: string
}

export type t_WidgetsScheduleRepairsParamSchema = {
  widgetName: string
}

export type t_WidgetsScheduleRepairsQuerySchema = {
  "api-version": string
}

export type t_WidgetsUpdateAnalyticsBodySchema = {
  repairCount?: number
  useCount?: number
}

export type t_WidgetsUpdateAnalyticsParamSchema = {
  widgetName: string
}

export type t_WidgetsUpdateAnalyticsQuerySchema = {
  "api-version": string
}