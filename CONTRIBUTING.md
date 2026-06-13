# Contributing

We welcome contributions that align with the projects vision. See the
[./README.md](./README.md) for an overview of what this project aims to be.

Preferably backwards compatibility should be preserved, but given the alpha
status of the project we won't hold ourselves to that just yet.

We use [Github issues][github-issues] to track work, though directly raising a
PR with a detailed description is fine too.

[github-issues]: https://github.com/mnahkies/openapi-code-generator/issues

<!-- toc -->

* [Setup](#setup)
* [Workflow](#workflow)
* [Typescript Conventions](#typescript-conventions)
* [Linting / Formatting](#linting--formatting)
* [Testing](#testing)
* [Publishing](#publishing)

<!-- tocstop -->

## Setup

1. Install [mise](https://mise.jdx.dev/)
2. Run `mise trust && mise i` (Ensures Node.js >= 22.x is used)
3. Install dependencies using `pnpm install`

## Workflow

See [package.json](./package.json) for available scripts.

Main ones of interest are `build`, `test`, `lint`. E.g:

```shell
pnpm run build
pnpm run test
pnpm run lint
```

There's also a `ci-pipeline` script that can be used as a pre-push check, e.g:

```shell
pnpm ci-pipeline && git push --force-with-lease
```

## Typescript Conventions

```shell
pnpm build
```

We strive for robust type safety, both in the library and the code it outputs.
That said we're also pragmatic - if it makes sense to use an `any` we will, but
we'll limit the scope to avoid its impact. Eg: the brief use of ts-ignore / any
in the fetch runtime [here][ts-ignore-example]

[ts-ignore-example]: https://github.com/mnahkies/openapi-code-generator/blob/10d7300b48f8eeb82170207a4a61b75b91674f08/packages/typescript-fetch-runtime/src/main.ts#L121-L125

## Linting / Formatting

```shell
pnpm lint
```

We use `biome` for formatting, and linting, largely sticking to the recommended rules.
The config can be seen here [./biome.json](./biome.json)

## Testing

```shell
pnpm run test # unit tests
pnpm run integration:generate && pnpm run integration:validate # integration test
pnpm run e2e:generate && pnpm run e2e:validate # e2e tests
```

We have three types of testing in play:

* Unit tests
* Integration tests
* E2E tests

### Unit Testing

All new code should include unit tests. These are the most useful in terms of catching regressions,
and run the fastest.

Use `pnpm run test`

### Integration Tests

We use publically available, large API surfaces to run our integration tests. Currently, this includes:

* Github API
* Stripe API
* Okta API (Identity and OAuth)
* Petstore API
* Azure Core Service and Resource Manager (TypeSpec)
* A Todo List API (written for this repo, showcases definitions split across
  multiple files)

At this stage we don't actually execute the code generated for these API's, but
the build check ensures that the generated code is syntactically correct and
type-safe.

Use `pnpm run integration:generate && pnpm run integration:validate`

### E2E Tests

E2E tests involve generating code for a specific specification and running
actual functional tests against it to ensure the runtime behavior is correct.

Use `pnpm run e2e:generate` to generate the test code and `pnpm run e2e:validate` to run
the tests.

## Publishing

The package is published using Github Actions as a [trusted publisher](https://docs.npmjs.com/trusted-publishers).

The release process is as follows:

1. Repository admin runs `pnpm publish:alpha` / `pnpm publish:release` against `main`
   * bumps the package versions
   * generates changelogs
   * commits and tags
2. When happy with the release commit / tags, push to `main`
3. The [publish-npm](./.github/workflows/publish-npm.yml) action will be triggered by the version tag, build and stage the packages to npm.
   * A repository admin will need to manually approve the workflow run.
4. Once the package is staged, a repository admin will need to review and approve on npm with 2FA
5. After publishing a release, manually create a release in Github.
