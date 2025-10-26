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

1. Install a node version manager that respects `.nvmrc` files, such as
   [fnm](https://github.com/Schniz/fnm)
2. Enable [corepack](https://nodejs.org/api/corepack.html) using `corepack
   enable`
3. Install `devDependencies` using `pnpm`

## Workflow

See [package.json](./package.json) for available scripts.

Main ones of interest are `build`, `test`, `lint`. E.g:

```shell
pnpm build
pnpm test
pnpm lint
pnpm format
```

To regenerate the integration tests:

```shell
pnpm integration:generate
```

And to build them / check the code output is valid:

```shell
pnpm integration:validate
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
pnpm format
```

We use `biome` for formatting, and linting, largely sticking to the recommended rules.
The config can be seen here [./biome.json](./biome.json)

## Testing

```shell
pnpm test
pnpm integration:generate && pnpm integration:validate
```

We have two types of testing in play:

* Unit tests using `jest`
* Integration tests

The unit testing is currently a bit on the "light" side - the project started
as a fun experiment on a weekend and there is still some back filling to do.
New code, and particularly bug fixes should include unit tests.

There is also a heavy reliance on integration tests, where we use the openapi
specifications for large API surfaces to run the code generation and check that
the result builds, currently this includes:

* Github API
* Stripe API
* Okta API (partial)
* Petstore API (from Swagger)
* A Todo List API (written for this repo, showcases definitions split across
  multiple files)

At this stage we don't actually execute the code generated for these API's, but
this would be a nice improvement for the future. The Github client in
particular gets a fair amount of use for automating tasks against my
workplace's Github organisation.

## Publishing

The package is published using Github Actions as a [trusted publisher](https://docs.npmjs.com/trusted-publishers).

The release process is as follows:

1. Repository admin runs `pnpm publish:alpha` / `pnpm publish:release` against `main`
   * bumps the package versions
   * generates changelogs
   * commits and tags
2. When happy with the release commit / tags, push to `main`
3. The [publish-npm](./.github/workflows/publish-npm.yml) action will be triggered by the version tag, build and publish the packages to npm.
   * A repository admin will need to manually approve the workflow run.

After publishing a release, manually create a release in Github.
