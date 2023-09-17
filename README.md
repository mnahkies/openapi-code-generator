# @nahkies/openapi-code-generator

This project should be considered alpha quality. However, as shown by the integration tests, it does a fair job of 
generating a strongly typed client for large/complex definitions like the GitHub api.

<!-- toc -->

- [Project Structure](#project-structure)
- [Documentation](#documentation)

<!-- tocstop -->

## Project Structure
The repository is structured as a mono repo of several npm packages that work together under [./packages](./packages):
- [openapi-code-generator](./packages/openapi-code-generator)
- [typescript-fetch-runtime](./packages/typescript-fetch-runtime)
- [typescript-koa-runtime](./packages/typescript-koa-runtime)

The `openapi-code-generator` package is the main package, whilst the others are supporting packages used at runtime by
the code output by some of the templates.

Integration test definitions live in [./integration-tests-definitions](./integration-tests-definitions) and the generated
code output to [./integration-tests](./integration-tests)

Scripts to refresh the test data live in [./scripts](./scripts)

## Documentation
Please see [./packages/openapi-code-generator](./packages/openapi-code-generator) for the main `README.md`, detailing the **goals**
of the project and **usage information**.

Contributing guidelines can be found in [./CONTRIBUTING.md](./CONTRIBUTING.md).

An overview of the codebase architecture is in [./packages/openapi-code-generator/ARCHITECTURE.md](./packages/openapi-code-generator/ARCHITECTURE.md)
