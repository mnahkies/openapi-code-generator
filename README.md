# @nahkies/openapi-code-generator

[![CI/CD](https://github.com/mnahkies/openapi-code-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/mnahkies/openapi-code-generator/actions?query=branch%3Amain+event%3Apush)
[![npm](https://img.shields.io/npm/v/@nahkies/openapi-code-generator.svg)](https://www.npmjs.com/package/@nahkies/openapi-code-generator)

`@nahkies/openapi-code-generator` is a CLI tool that aims to generate high quality typescript client SDK's,
and API server scaffolding (routing, validation, serialization) from api specifications.

Currently, [OpenAPI 3.0.x](https://spec.openapis.org/oas/v3.0.4.html), [OpenAPI 3.1.x](https://spec.openapis.org/oas/v3.1.1.html),
and [TypeSpec](https://typespec.io/) are supported as input specifications.

With typescript templates for [koa](https://openapi-code-generator.nahkies.co.nz/guides/server-templates/typescript-koa), [express](https://openapi-code-generator.nahkies.co.nz/guides/server-templates/typescript-express), [fetch](https://openapi-code-generator.nahkies.co.nz/guides/client-templates/typescript-fetch), [axios](https://openapi-code-generator.nahkies.co.nz/guides/client-templates/typescript-axios), and [angular](https://openapi-code-generator.nahkies.co.nz/guides/client-templates/typescript-angular) currently available.

The [fetch](https://openapi-code-generator.nahkies.co.nz/guides/client-templates/typescript-fetch) and [axios](https://openapi-code-generator.nahkies.co.nz/guides/client-templates/typescript-axios) templates work great in conjunction with [react-query](https://tanstack.com/query/latest)

> [!TIP]
> Try out our [interactive playground here](https://openapi-code-generator.nahkies.co.nz/playground)

<!-- toc -->

- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

<!-- tocstop -->

## Documentation

Visit https://openapi-code-generator.nahkies.co.nz/ for detailed documentation including
quick start guides and reference material.

The documentation is built using NextJS / Nextra, and deployed using Github pages.
You can contribute to it in [./packages/documentation](./packages/documentation)

## Project Structure

The repository is structured as a mono repo of several npm packages that work together under [./packages](./packages):

- [openapi-code-generator](./packages/openapi-code-generator)
- [typescript-axios-runtime](./packages/typescript-axios-runtime)
- [typescript-express-runtime](./packages/typescript-express-runtime)
- [typescript-fetch-runtime](./packages/typescript-fetch-runtime)
- [typescript-koa-runtime](./packages/typescript-koa-runtime)

The `openapi-code-generator` package is the main package, whilst the others are supporting packages used at runtime by
the code output by some of the templates.

Integration test definitions live in [./integration-tests-definitions](./integration-tests-definitions) and the generated
code output to [./integration-tests](./integration-tests)

Scripts to refresh the test data live in [./scripts](./scripts)

## Contributing

Contributing guidelines can be found in [./CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT Licensed, see [./LICENSE](./LICENSE)
