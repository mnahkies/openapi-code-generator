# @nahkies/openapi-code-generator

This package should be considered alpha quality. However, as shown by the integration tests, it does a fair job of
generating a strongly typed client for large/complex definitions like the GitHub api.

<!-- toc -->

- [Project Goal](#project-goal)
- [Usage](#usage)

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

Usage like so:
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

For runtime phrasing / validation.

Configuration can be provided as cli arguments or environment variables. See [config.ts](./packages/openapi-code-generator/src/config.ts) for
exact details.

