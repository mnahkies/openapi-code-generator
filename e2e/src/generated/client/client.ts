/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import { t_RandomNumber } from "./models"
import {
  AbstractFetchClient,
  AbstractFetchClientConfig,
  Res,
  TypedFetchResponse,
} from "@nahkies/typescript-fetch-runtime/main"

export interface ApiClientConfig extends AbstractFetchClientConfig {}

export class ApiClient extends AbstractFetchClient {
  constructor(config: ApiClientConfig) {
    super(config)
  }

  async getValidationNumbersRandomNumber(
    p: {
      max?: number
      min?: number
      forbidden?: number[]
    } = {},
    timeout?: number,
    opts?: RequestInit,
  ): Promise<TypedFetchResponse<Res<200, t_RandomNumber>>> {
    const url = this.basePath + `/validation/numbers/random-number`
    const query = this._query({
      max: p["max"],
      min: p["min"],
      forbidden: p["forbidden"],
    })

    return this._fetch(url + query, { method: "GET", ...(opts ?? {}) }, timeout)
  }
}