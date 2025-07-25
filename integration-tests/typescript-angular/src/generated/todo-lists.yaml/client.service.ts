/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {
  t_CreateUpdateTodoList,
  t_Error,
  t_Statuses,
  t_TodoList,
  t_UnknownObject,
} from "./models"
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http"
import {Injectable} from "@angular/core"
import {Observable} from "rxjs"

export class TodoListsExampleApiServiceServersOperations {
  static listAttachments(url?: "{schema}://{tenant}.attachments.example.com"): {
    build: (
      schema?: "http" | "https",
      tenant?: string,
    ) => Server<"listAttachments_TodoListsExampleApiService">
  }
  static listAttachments(url?: "https://attachments.example.com"): {
    build: () => Server<"listAttachments_TodoListsExampleApiService">
  }
  static listAttachments(
    url: string = "{schema}://{tenant}.attachments.example.com",
  ): unknown {
    switch (url) {
      case "{schema}://{tenant}.attachments.example.com":
        return {
          build(
            schema: "http" | "https" = "https",
            tenant = "your-slug",
          ): Server<"listAttachments_TodoListsExampleApiService"> {
            return "{schema}://{tenant}.attachments.example.com"
              .replace("{schema}", schema)
              .replace(
                "{tenant}",
                tenant,
              ) as Server<"listAttachments_TodoListsExampleApiService">
          },
        }

      case "https://attachments.example.com":
        return {
          build(): Server<"listAttachments_TodoListsExampleApiService"> {
            return "https://attachments.example.com" as Server<"listAttachments_TodoListsExampleApiService">
          },
        }

      default:
        throw new Error(`no matching server for url '${url}'`)
    }
  }

  static uploadAttachment(
    url?: "{schema}://{tenant}.attachments.example.com",
  ): {
    build: (
      schema?: "http" | "https",
      tenant?: string,
    ) => Server<"uploadAttachment_TodoListsExampleApiService">
  }
  static uploadAttachment(url?: "https://attachments.example.com"): {
    build: () => Server<"uploadAttachment_TodoListsExampleApiService">
  }
  static uploadAttachment(
    url: string = "{schema}://{tenant}.attachments.example.com",
  ): unknown {
    switch (url) {
      case "{schema}://{tenant}.attachments.example.com":
        return {
          build(
            schema: "http" | "https" = "https",
            tenant = "your-slug",
          ): Server<"uploadAttachment_TodoListsExampleApiService"> {
            return "{schema}://{tenant}.attachments.example.com"
              .replace("{schema}", schema)
              .replace(
                "{tenant}",
                tenant,
              ) as Server<"uploadAttachment_TodoListsExampleApiService">
          },
        }

      case "https://attachments.example.com":
        return {
          build(): Server<"uploadAttachment_TodoListsExampleApiService"> {
            return "https://attachments.example.com" as Server<"uploadAttachment_TodoListsExampleApiService">
          },
        }

      default:
        throw new Error(`no matching server for url '${url}'`)
    }
  }
}

export class TodoListsExampleApiServiceServers {
  static default(): Server<"TodoListsExampleApiService"> {
    return TodoListsExampleApiServiceServers.server().build()
  }

  static server(url?: "{schema}://{tenant}.todo-lists.example.com"): {
    build: (
      schema?: "http" | "https",
      tenant?: string,
    ) => Server<"TodoListsExampleApiService">
  }
  static server(url?: "https://todo-lists.example.com"): {
    build: () => Server<"TodoListsExampleApiService">
  }
  static server(
    url: string = "{schema}://{tenant}.todo-lists.example.com",
  ): unknown {
    switch (url) {
      case "{schema}://{tenant}.todo-lists.example.com":
        return {
          build(
            schema: "http" | "https" = "https",
            tenant = "your-slug",
          ): Server<"TodoListsExampleApiService"> {
            return "{schema}://{tenant}.todo-lists.example.com"
              .replace("{schema}", schema)
              .replace(
                "{tenant}",
                tenant,
              ) as Server<"TodoListsExampleApiService">
          },
        }

      case "https://todo-lists.example.com":
        return {
          build(): Server<"TodoListsExampleApiService"> {
            return "https://todo-lists.example.com" as Server<"TodoListsExampleApiService">
          },
        }

      default:
        throw new Error(`no matching server for url '${url}'`)
    }
  }

  static readonly operations = TodoListsExampleApiServiceServersOperations
}

export class TodoListsExampleApiServiceConfig {
  basePath: Server<"TodoListsExampleApiService"> | string =
    TodoListsExampleApiServiceServers.default()
  defaultHeaders: Record<string, string> = {}
}

// from https://stackoverflow.com/questions/39494689/is-it-possible-to-restrict-number-to-a-certain-range
type Enumerate<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>

type IntRange<F extends number, T extends number> = F extends T
  ? F
  : Exclude<Enumerate<T>, Enumerate<F>> extends never
    ? never
    : Exclude<Enumerate<T>, Enumerate<F>> | T

export type StatusCode1xx = IntRange<100, 199>
export type StatusCode2xx = IntRange<200, 299>
export type StatusCode3xx = IntRange<300, 399>
export type StatusCode4xx = IntRange<400, 499>
export type StatusCode5xx = IntRange<500, 599>
export type StatusCode =
  | StatusCode1xx
  | StatusCode2xx
  | StatusCode3xx
  | StatusCode4xx
  | StatusCode5xx

export type QueryParams = {
  [name: string]:
    | string
    | number
    | boolean
    | string[]
    | undefined
    | null
    | QueryParams
    | QueryParams[]
}

export type Server<T> = string & {__server__: T}

@Injectable({
  providedIn: "root",
})
export class TodoListsExampleApiService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly config: TodoListsExampleApiServiceConfig,
  ) {}

  private _headers(
    headers: Record<string, string | undefined>,
  ): Record<string, string> {
    return Object.fromEntries(
      Object.entries({...this.config.defaultHeaders, ...headers}).filter(
        (it): it is [string, string] => it[1] !== undefined,
      ),
    )
  }

  private _queryParams(queryParams: QueryParams): HttpParams {
    return Object.entries(queryParams).reduce((result, [name, value]) => {
      if (
        typeof value === "string" ||
        typeof value === "boolean" ||
        typeof value === "number"
      ) {
        return result.set(name, value)
      } else if (value === null || value === undefined) {
        return result
      }
      throw new Error(
        `query parameter '${name}' with value '${value}' is not yet supported`,
      )
    }, new HttpParams())
  }

  getTodoLists(
    p: {created?: string; statuses?: t_Statuses; tags?: string[]} = {},
  ): Observable<
    (HttpResponse<t_TodoList[]> & {status: 200}) | HttpResponse<unknown>
  > {
    const headers = this._headers({Accept: "application/json"})
    const params = this._queryParams({
      created: p["created"],
      statuses: p["statuses"],
      tags: p["tags"],
    })

    return this.httpClient.request<any>("GET", this.config.basePath + `/list`, {
      params,
      headers,
      observe: "response",
      reportProgress: false,
    })
  }

  getTodoListById(p: {
    listId: string
  }): Observable<
    | (HttpResponse<t_TodoList> & {status: 200})
    | (HttpResponse<t_Error> & {status: StatusCode4xx})
    | (HttpResponse<void> & {status: StatusCode})
    | HttpResponse<unknown>
  > {
    const headers = this._headers({Accept: "application/json"})

    return this.httpClient.request<any>(
      "GET",
      this.config.basePath + `/list/${p["listId"]}`,
      {
        headers,
        observe: "response",
        reportProgress: false,
      },
    )
  }

  updateTodoListById(p: {
    listId: string
    requestBody: t_CreateUpdateTodoList
  }): Observable<
    | (HttpResponse<t_TodoList> & {status: 200})
    | (HttpResponse<t_Error> & {status: StatusCode4xx})
    | (HttpResponse<void> & {status: StatusCode})
    | HttpResponse<unknown>
  > {
    const headers = this._headers({
      Accept: "application/json",
      "Content-Type": "application/json",
    })
    const body = p["requestBody"]

    return this.httpClient.request<any>(
      "PUT",
      this.config.basePath + `/list/${p["listId"]}`,
      {
        headers,
        body,
        observe: "response",
        reportProgress: false,
      },
    )
  }

  deleteTodoListById(p: {
    listId: string
  }): Observable<
    | (HttpResponse<void> & {status: 204})
    | (HttpResponse<t_Error> & {status: StatusCode4xx})
    | (HttpResponse<void> & {status: StatusCode})
    | HttpResponse<unknown>
  > {
    const headers = this._headers({Accept: "application/json"})

    return this.httpClient.request<any>(
      "DELETE",
      this.config.basePath + `/list/${p["listId"]}`,
      {
        headers,
        observe: "response",
        reportProgress: false,
      },
    )
  }

  getTodoListItems(p: {listId: string}): Observable<
    | (HttpResponse<{
        completedAt?: string
        content: string
        createdAt: string
        id: string
      }> & {status: 200})
    | (HttpResponse<{
        code: string
        message: string
      }> & {status: StatusCode5xx})
    | HttpResponse<unknown>
  > {
    const headers = this._headers({Accept: "application/json"})

    return this.httpClient.request<any>(
      "GET",
      this.config.basePath + `/list/${p["listId"]}/items`,
      {
        headers,
        observe: "response",
        reportProgress: false,
      },
    )
  }

  createTodoListItem(p: {
    listId: string
    requestBody: {
      completedAt?: string
      content: string
      id: string
    }
  }): Observable<(HttpResponse<void> & {status: 204}) | HttpResponse<unknown>> {
    const headers = this._headers({
      Accept: "application/json",
      "Content-Type": "application/json",
    })
    const body = p["requestBody"]

    return this.httpClient.request<any>(
      "POST",
      this.config.basePath + `/list/${p["listId"]}/items`,
      {
        headers,
        body,
        observe: "response",
        reportProgress: false,
      },
    )
  }

  listAttachments(
    basePath:
      | Server<"listAttachments_TodoListsExampleApiService">
      | string = TodoListsExampleApiServiceServers.operations
      .listAttachments()
      .build(),
  ): Observable<
    (HttpResponse<t_UnknownObject[]> & {status: 200}) | HttpResponse<unknown>
  > {
    const headers = this._headers({Accept: "application/json"})

    return this.httpClient.request<any>("GET", basePath + `/attachments`, {
      headers,
      observe: "response",
      reportProgress: false,
    })
  }

  uploadAttachment(
    p: {
      requestBody: never
    },
    basePath:
      | Server<"uploadAttachment_TodoListsExampleApiService">
      | string = TodoListsExampleApiServiceServers.operations
      .uploadAttachment()
      .build(),
  ): Observable<(HttpResponse<void> & {status: 202}) | HttpResponse<unknown>> {
    const headers = this._headers({Accept: "application/json"})

    return this.httpClient.request<any>("POST", basePath + `/attachments`, {
      headers,
      // todo: request bodies with content-type 'multipart/form-data' not yet supported,
      observe: "response",
      reportProgress: false,
    })
  }
}

export {TodoListsExampleApiService as ApiClient}
export {TodoListsExampleApiServiceConfig as ApiClientConfig}
