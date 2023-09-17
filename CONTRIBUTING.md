# Contributing
We welcome contributions that align with the projects vision. See the [./README.md](./README.md) for an overview of what this project aims to be.

Preferably backwards compatibility should be preserved, but given the alpha status 
of the project we won't hold ourselves to that just yet.

We use [Github issues](https://github.com/mnahkies/openapi-code-generator/issues) to track work, though directly raising a PR with a detailed description is fine too.

<!-- toc -->

- [Setup](#setup)
- [Workflow](#workflow)
- [Typescript Conventions](#typescript-conventions)
- [Linting / Formatting](#linting--formatting)
- [Testing](#testing)

<!-- tocstop -->

## Setup

1. Install a node version manager that respects `.nvmrc` files, such as [fnm](https://github.com/Schniz/fnm)
2. Enable [corepack](https://nodejs.org/api/corepack.html) using `corepack enable`
3. Install `devDependencies` using `yarn`

## Workflow
See [package.json](./package.json) for available scripts.
Main ones of interest are `build`, `test`, `lint`. Eg:

```shell
yarn build
yarn test
yarn lint
yarn format
```

To regenerate the integration tests:
```shell
yarn integration:generate
```
And to build them / check the code output is valid:
```shell
yarn integration:validate
```

There's also a `ci-pipeline` script that can be used as a pre-push check, eg:
```shell
yarn ci-pipeline && git push --force-with-lease
```

## Typescript Conventions
We strive for robust type safety, both in the library and the code it outputs.
That said we're also pragmatic - if it makes sense to use an `any` we will, but we'll
limit the scope to avoid its impact. Eg: the brief use of ts-ignore / any in the fetch runtime
[here](https://github.com/mnahkies/openapi-code-generator/blob/10d7300b48f8eeb82170207a4a61b75b91674f08/packages/typescript-fetch-runtime/src/main.ts#L121-L125)

## Linting / Formatting
We use `eslint` for linting, largely sticking to the recommended rules. 
The config can be seen here [./.eslintrc.js](./.eslintrc.js)

We're incrementally adopting prettier for code formatting. 
To include a file a pragma must be added to the beginning like so:
```typescript
/**
 * @prettier
 */
```

In general new files should include the pragma, and it should be added to 
old files if they undergo significant change.

## Testing
We have two types of testing in play:
- Unit tests using `jest`
- Integration tests

The unit testing is currently a bit on the "light" side - the project started as a fun experiment on a weekend
and there is still some back filling to do. New code, and particularly bug fixes should include unit tests.

There is also a heavy reliance on integration tests, where we use the openapi specifications for large API surfaces
to run the code generation and check that the result builds, currently this includes:
- Github API
- Stripe API
- Okta API (partial)
- Petstore API (from Swagger)
- A Todo List API (written for this repo, showcases definitions split across multiple files)

At this stage we don't actually execute the code generated for these API's, but this would be a nice improvement for
the future. The Github client in particular gets a fair amount of use for automating tasks against my workplaces Github organisation.
