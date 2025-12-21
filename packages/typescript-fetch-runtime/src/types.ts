import type {
  HeaderParams,
  QueryParams,
  Server,
  StatusCode,
  StatusCode1xx,
  StatusCode2xx,
  StatusCode3xx,
  StatusCode4xx,
  StatusCode5xx,
} from "@nahkies/typescript-common-runtime/types"

export type {
  QueryParams,
  HeaderParams,
  StatusCode,
  StatusCode1xx,
  StatusCode2xx,
  StatusCode3xx,
  StatusCode4xx,
  StatusCode5xx,
  Server,
}

export interface Res<Status extends StatusCode, JsonBody> extends Response {
  status: Status
  json: () => Promise<JsonBody>
}

export interface AbstractFetchClientConfig {
  basePath: string
  defaultHeaders?: Record<string, string>
  defaultTimeout?: number
}

// fetch HeadersInit type
export type HeadersInit =
  | string[][]
  | readonly (readonly [string, string])[]
  | Record<string, string | ReadonlyArray<string>>
  | Headers
