# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.21.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.20.1...v0.21.0) (2025-07-26)

### Features

- support application/x-www-form-urlencoded request bodies ([#352](https://github.com/mnahkies/openapi-code-generator/issues/352)) ([0aecf2a](https://github.com/mnahkies/openapi-code-generator/commit/0aecf2adc436c5e342cc9cc47ee47aa84dd9314b))
- support text/plain request bodies ([#350](https://github.com/mnahkies/openapi-code-generator/issues/350)) ([eba568f](https://github.com/mnahkies/openapi-code-generator/commit/eba568fbb694de40c374a06f7feefa15f6d6e7a9))

### BREAKING CHANGES

- `typescript-express` `ServerConfig['body']` shape
  changed to accommodate configuring multiple body parsers

## [0.20.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.20.0...v0.20.1) (2025-05-31)

**Note:** Version bump only for package @nahkies/typescript-express-runtime

# [0.20.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.19.2...v0.20.0) (2025-05-05)

### Bug Fixes

- clean tsconfig.tsbuildinfo ([#327](https://github.com/mnahkies/openapi-code-generator/issues/327)) ([a64f9e3](https://github.com/mnahkies/openapi-code-generator/commit/a64f9e3a31a9e981a13594c9aecb27109aca9a3c))

### Features

- typescript-express server template ([#324](https://github.com/mnahkies/openapi-code-generator/issues/324)) ([af9a1e7](https://github.com/mnahkies/openapi-code-generator/commit/af9a1e729782eceff05dee008f5a8719bc835e5c)), closes [#152](https://github.com/mnahkies/openapi-code-generator/issues/152) [#316](https://github.com/mnahkies/openapi-code-generator/issues/316)
