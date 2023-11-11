# @nahkies/openapi-code-generator

![CI/CD](https://github.com/mnahkies/openapi-code-generator/actions/workflows/ci.yml/badge.svg)
[![npm](https://img.shields.io/npm/v/@nahkies/openapi-code-generator.svg)](https://www.npmjs.com/package/@nahkies/openapi-code-generator)

Generate typescript client SDK's and API server scaffolding (routing, validation, serialization) from OpenAPI 3 specifications.

This package should be considered alpha quality. However, as shown by the integration tests, it does a fair job of
generating a strongly typed client for large/complex definitions like the GitHub api.

<!-- toc -->

- [Project Goal](#project-goal)
- [Usage](#usage)
- [Client Examples](#client-examples)
  - [Typescript Fetch](#typescript-fetch)
  - [Typescript Angular](#typescript-angular)
- [Server Examples](#server-examples)
  - [Typescript Koa](#typescript-koa)
    - [Custom Koa app / configuration](#custom-koa-app--configuration)
- [More information / contributing](#more-information--contributing)

<!-- tocstop -->

## Project Goal

To make it fun, easy and productive to generate both client and server "glue"
code from openapi 3 definitions. This is code that is tedious and error prone to maintain by hand,
by automating it we can reduce toil and frustration.

The generated code output should be "stable" in the sense that it will not
arbitrarily change between generation without need (for a given version). For
example outputting entities in alphabetic order where possible.

It should also be generated in a way that human would reasonably write it,
the intent is that the generated code can and should be committed to the consuming project
repositories, allowing it to be reviewed, and audited overtime.

This is particularly useful in the case of mistakes in the generation or schemas

The initial focus on `typescript`, with an intention to later support other languages. `kotlin` is the
most likely candidate for a second language.

## Usage

Install as a `devDependency` in the consuming project, or execute using `npx`

```shell
yarn add --dev @nahkies/openapi-code-generator
```

See available options using:

```shell
yarn openapi-code-generator --help
```

Or looking at the code defining them in [index.ts](./src/index.ts).
All options can be provided as either cli arguments or environment variables.

Example usage:

```shell
yarn openapi-code-generator --input="./openapi.yaml" --out="./src/" --template=typescript-koa
```

Where template is one of:

- typescript-angular
- typescript-fetch
- typescript-koa

There is an optional parameter `schema-builder` for choosing between:

- [zod](https://zod.dev/) (default)
- [joi](https://joi.dev/)

For runtime phrasing / validation of schemas (eg: responses, parameters).

## Client Examples

There are two client templates:

- `typescript-fetch`
- `typescript-angular`

### Typescript Fetch

The `typescript-fetch` template outputs a client SDK based on the [fetch api](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) that gives the following:

- Typed methods to call each endpoint
- Support for passing a `timeout`, abort signals are still respected

It does not yet support runtime validation/parsing - compile time type safety only at this stage.

See [integration-tests/typescript-fetch](../../integration-tests/typescript-fetch) for more samples.

Dependencies:

```shell
yarn add @nahkies/typescript-fetch-runtime
```

If you're using a version of NodeJS that doesn't include the `fetch` API, you may need a polyfill like [node-fetch](https://www.npmjs.com/package/node-fetch)

Running:

```shell
yarn openapi-code-generator \
  --input ./openapi.yaml \
  --output ./src/clients/some-service \
  --template typescript-fetch
```

Will output these files into `./src/clients/some-service`:

- `./client.ts`: exports a class `ApiClient` that implements methods for calling each endpoint
- `./models.ts`: exports typescript types

Once generated usage should look something like this:

```typescript
const client = new ApiClient({
  basePath: `http://localhost:${address.port}`,
  defaultHeaders: {
    "Content-Type": "application/json",
    "Authorisation": "Bearer: <TOKEN>" // can pass auth headers here
  },
})

const res = await client.createTodoListItem({
  listId: list.id,
  requestBody: {content: "test item"},
  // optionally pass a timeout (ms), or any arbitrary fetch options (eg: an abort signal)
  // timeout?: number,
  // opts?: RequestInit
})

// checking the status code narrows the response body types (ie: remove error types from the type union)
if (res.status !== 200) {
  throw new Error("failed to create item")
}

// body will be typed correctly
const body = await res.json()
console.log(`id is: ${body.id}`)
```

### Typescript Angular

**Note: this is the least battle tested of the templates and most likely to have critical bugs**

The `typescript-angular` template outputs a client SDK based on the [Angular HttpClient](https://angular.io/api/common/http/HttpClient) that gives the following:

- Typed methods to call each endpoint returning an [RxJS Observable](https://rxjs.dev/guide/observable)

It does not yet support runtime validation/parsing - compile time type safety only at this stage.

See [integration-tests/typescript-angular](../../integration-tests/typescript-angular) for more samples.

Running:

```shell
yarn openapi-code-generator \
  --input ./openapi.yaml \
  --output ./src/app/clients/some-service \
  --template typescript-angular
```

Will output these files into `./src/app/clients/some-service`:

- `./api.module.ts`: exports a class `ApiModule` as an `NgModule`
- `./client.service.ts`: exports a class `ApiClient` as injectable Angular service
- `./models.ts`: exports typescript types

Once generated usage should look something like this:

```typescript
// Root Angular module
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ApiModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {

  // inject into your component
  constructor(client: ApiClient) {

    client.updateTodoListById({listId: "1", requestBody: {name: "Foo"}})
      .subscribe(next => {
        if (next.status === 200) {
          // TODO: body is currently incorrectly `unknown` here
          console.log(next.body.id)
        }
      })
  }
}
```

## Server Examples

Currently, there is a single server template: `typescript-koa`

Support for `express` or other frameworks may be added in future.

### Typescript Koa

The `typescript-koa` template outputs scaffolding code that handles the following:

- Building a [@koa/router](https://www.npmjs.com/package/@koa/router) instance with all routes in the openapi specification
- Generating types and runtime schema parsers for all request parameters/bodies and response bodies
- Generating types for route handlers that receive validated inputs, and have return types that are additionally validated at runtime prior to sending the response
- (Optionally) Actually starting the server and binding to a port

See [integration-tests/typescript-koa](../../integration-tests/typescript-koa) for more samples.

Dependencies:

```shell
yarn add @nahkies/typescript-koa-runtime @koa/cors @koa/router koa koa-body zod
yarn add --dev @types/koa @types/koa__router
```

Running:

```shell
yarn openapi-code-generator \
  --input ./openapi.yaml \
  --output ./src \
  --template typescript-koa \
  --schema-builder zod
```

Will output three files into `./src`:

- `generated.ts` - exports a `createRouter` and `bootstrap` function, along with associated types used to create your server
- `models.ts` - exports typescript types for schemas
- `schemas.ts` - exports runtime schema validators

Once generated usage should look something like this:

```typescript
import {bootstrap, createRouter, CreateTodoList, GetTodoLists} from "../generated"

// Define your route implementations as async functions implementing the types
// exported from generated.ts
const createTodoList: CreateTodoList = async ({body}) => {
  const list = await prisma.todoList.create({
    data: {
      // body is strongly typed and parsed at runtime
      name: body.name
    }
  })

  // response is strongly typed pattern matching the status code against the response schema,
  // and doing runtime validation before sending the response
  return {
    status: 200 as const,
    body: dbListToApiList(list)
  }
}

const getTodoLists: GetTodoLists = async ({query}) => {
  // omitted for brevity
}

// Starts a server listening on `port`
bootstrap({
  router: createRouter({getTodoLists, createTodoList}),
  port: 8080
})
```

#### Custom Koa app / configuration

The provided `bootstrap` function has a limited range of options. For more advanced use-cases, eg: `https`, or binding to a
specific ip address you will need to construct your own Koa `app`.

The only real requirement is that you provide a body parsing middleware before the `router` that places a parsed request body
on the `ctx.body` property.

Eg:

```typescript
import {createRouter} from "../generated"
import KoaBody from "koa-body"

// ...implement routes where

const app = new Koa()

// it doesn't have to be koa-body, but it does need to put the parsed body on `ctx.body`
app.use(KoaBody())

// mount the generated router
const router = createRouter({getTodoLists, createTodoList})
app.use(router.allowedMethods())
app.use(router.routes())

app.listen(8080, '127.0.0.1', () => {
  console.info("listening")
})
```

## More information / contributing

Refer to top level [README.md](../../README.md) / [CONTRIBUTING.md](../../CONTRIBUTING.md)
