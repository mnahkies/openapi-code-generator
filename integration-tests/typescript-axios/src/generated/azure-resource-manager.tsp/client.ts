/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {
  t_Azure_Core_uuid,
  t_Employee,
  t_EmployeeListResult,
  t_EmployeeUpdate,
  t_MoveRequest,
  t_MoveResponse,
  t_OperationListResult,
} from "./models"
import {
  AbstractAxiosClient,
  AbstractAxiosConfig,
} from "@nahkies/typescript-axios-runtime/main"
import { AxiosRequestConfig, AxiosResponse } from "axios"

export class ApiClient extends AbstractAxiosClient {
  constructor(config: AbstractAxiosConfig) {
    super(config)
  }

  async operationsList(
    p: {
      apiVersion: string
    },
    timeout?: number,
    opts: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<t_OperationListResult>> {
    const url = `/providers/Microsoft.ContosoProviderHub/operations`
    const headers = this._headers({}, opts.headers)
    const query = this._query({ "api-version": p["apiVersion"] })

    return this._request({
      url: url + query,
      method: "GET",
      ...(timeout ? { timeout } : {}),
      ...opts,
      headers,
    })
  }

  async employeesGet(
    p: {
      apiVersion: string
      subscriptionId: t_Azure_Core_uuid
      resourceGroupName: string
      employeeName: string
    },
    timeout?: number,
    opts: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<t_Employee>> {
    const url = `/subscriptions/${p["subscriptionId"]}/resourceGroups/${p["resourceGroupName"]}/providers/Microsoft.ContosoProviderHub/employees/${p["employeeName"]}`
    const headers = this._headers({}, opts.headers)
    const query = this._query({ "api-version": p["apiVersion"] })

    return this._request({
      url: url + query,
      method: "GET",
      ...(timeout ? { timeout } : {}),
      ...opts,
      headers,
    })
  }

  async employeesCreateOrUpdate(
    p: {
      apiVersion: string
      subscriptionId: t_Azure_Core_uuid
      resourceGroupName: string
      employeeName: string
      requestBody: t_Employee
    },
    timeout?: number,
    opts: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<t_Employee>> {
    const url = `/subscriptions/${p["subscriptionId"]}/resourceGroups/${p["resourceGroupName"]}/providers/Microsoft.ContosoProviderHub/employees/${p["employeeName"]}`
    const headers = this._headers(
      { "Content-Type": "application/json" },
      opts.headers,
    )
    const query = this._query({ "api-version": p["apiVersion"] })
    const body = JSON.stringify(p.requestBody)

    return this._request({
      url: url + query,
      method: "PUT",
      data: body,
      ...(timeout ? { timeout } : {}),
      ...opts,
      headers,
    })
  }

  async employeesUpdate(
    p: {
      apiVersion: string
      subscriptionId: t_Azure_Core_uuid
      resourceGroupName: string
      employeeName: string
      requestBody: t_EmployeeUpdate
    },
    timeout?: number,
    opts: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<t_Employee>> {
    const url = `/subscriptions/${p["subscriptionId"]}/resourceGroups/${p["resourceGroupName"]}/providers/Microsoft.ContosoProviderHub/employees/${p["employeeName"]}`
    const headers = this._headers(
      { "Content-Type": "application/json" },
      opts.headers,
    )
    const query = this._query({ "api-version": p["apiVersion"] })
    const body = JSON.stringify(p.requestBody)

    return this._request({
      url: url + query,
      method: "PATCH",
      data: body,
      ...(timeout ? { timeout } : {}),
      ...opts,
      headers,
    })
  }

  async employeesDelete(
    p: {
      apiVersion: string
      subscriptionId: t_Azure_Core_uuid
      resourceGroupName: string
      employeeName: string
    },
    timeout?: number,
    opts: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<void>> {
    const url = `/subscriptions/${p["subscriptionId"]}/resourceGroups/${p["resourceGroupName"]}/providers/Microsoft.ContosoProviderHub/employees/${p["employeeName"]}`
    const headers = this._headers({}, opts.headers)
    const query = this._query({ "api-version": p["apiVersion"] })

    return this._request({
      url: url + query,
      method: "DELETE",
      ...(timeout ? { timeout } : {}),
      ...opts,
      headers,
    })
  }

  async employeesListByResourceGroup(
    p: {
      apiVersion: string
      subscriptionId: t_Azure_Core_uuid
      resourceGroupName: string
    },
    timeout?: number,
    opts: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<t_EmployeeListResult>> {
    const url = `/subscriptions/${p["subscriptionId"]}/resourceGroups/${p["resourceGroupName"]}/providers/Microsoft.ContosoProviderHub/employees`
    const headers = this._headers({}, opts.headers)
    const query = this._query({ "api-version": p["apiVersion"] })

    return this._request({
      url: url + query,
      method: "GET",
      ...(timeout ? { timeout } : {}),
      ...opts,
      headers,
    })
  }

  async employeesListBySubscription(
    p: {
      apiVersion: string
      subscriptionId: t_Azure_Core_uuid
    },
    timeout?: number,
    opts: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<t_EmployeeListResult>> {
    const url = `/subscriptions/${p["subscriptionId"]}/providers/Microsoft.ContosoProviderHub/employees`
    const headers = this._headers({}, opts.headers)
    const query = this._query({ "api-version": p["apiVersion"] })

    return this._request({
      url: url + query,
      method: "GET",
      ...(timeout ? { timeout } : {}),
      ...opts,
      headers,
    })
  }

  async employeesMove(
    p: {
      apiVersion: string
      subscriptionId: t_Azure_Core_uuid
      resourceGroupName: string
      employeeName: string
      requestBody: t_MoveRequest
    },
    timeout?: number,
    opts: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<t_MoveResponse>> {
    const url = `/subscriptions/${p["subscriptionId"]}/resourceGroups/${p["resourceGroupName"]}/providers/Microsoft.ContosoProviderHub/employees/${p["employeeName"]}/move`
    const headers = this._headers(
      { "Content-Type": "application/json" },
      opts.headers,
    )
    const query = this._query({ "api-version": p["apiVersion"] })
    const body = JSON.stringify(p.requestBody)

    return this._request({
      url: url + query,
      method: "POST",
      data: body,
      ...(timeout ? { timeout } : {}),
      ...opts,
      headers,
    })
  }
}