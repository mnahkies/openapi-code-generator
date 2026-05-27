# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.24.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.23.0...v0.24.0) (2026-05-27)

### Bug Fixes

- extranous runtime deps bundled ([#471](https://github.com/mnahkies/openapi-code-generator/issues/471)) ([4ca6a09](https://github.com/mnahkies/openapi-code-generator/commit/4ca6a09f6f21a6a27a57118f9693e9750dab4752))

# [0.23.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.22.0...v0.23.0) (2026-05-09)

### Bug Fixes

- clean works when already clean ([#460](https://github.com/mnahkies/openapi-code-generator/issues/460)) ([8c18a69](https://github.com/mnahkies/openapi-code-generator/commit/8c18a69534ffa0c6d0413550ac43c827bbf07505))
- only package dist/esm, dist/cjs ([#453](https://github.com/mnahkies/openapi-code-generator/issues/453)) ([66e9be5](https://github.com/mnahkies/openapi-code-generator/commit/66e9be5a28c8bed5b6932d59be3602c4f7ebe85a))
- required peer dependencies ([#459](https://github.com/mnahkies/openapi-code-generator/issues/459)) ([2ebc911](https://github.com/mnahkies/openapi-code-generator/commit/2ebc9113ad81439c725eb734a0af02477bc4c4f7))
- use global symbol for SkipResponse ([#455](https://github.com/mnahkies/openapi-code-generator/issues/455)) ([05f4e6e](https://github.com/mnahkies/openapi-code-generator/commit/05f4e6e9206c7a89ac7d0f3687e6b8a6de2df888))

- refactor!: move more response processing into runtime package (#405) ([b47bb5a](https://github.com/mnahkies/openapi-code-generator/commit/b47bb5a0b157f8e7bc8c745c5d481f4c7e6c0c93)), closes [#405](https://github.com/mnahkies/openapi-code-generator/issues/405)
- feat!: introduce a new common runtime (#401) ([1306741](https://github.com/mnahkies/openapi-code-generator/commit/13067416c6882375cc72f5af21dd18c7f950259b)), closes [#401](https://github.com/mnahkies/openapi-code-generator/issues/401) [#381](https://github.com/mnahkies/openapi-code-generator/issues/381)

### Features

- adopt tsdown for cli package, inline the typescript-common-runtime ([#456](https://github.com/mnahkies/openapi-code-generator/issues/456)) ([a4ca411](https://github.com/mnahkies/openapi-code-generator/commit/a4ca411802ca8f805b3edb639a55c69acebb9b23))
- bundle esm + cjs variants of runtime packages using tsdown ([#452](https://github.com/mnahkies/openapi-code-generator/issues/452)) ([7a6dc89](https://github.com/mnahkies/openapi-code-generator/commit/7a6dc8966638565fa8a67d482ffd791054647c70))
- enable publint and attw ([#454](https://github.com/mnahkies/openapi-code-generator/issues/454)) ([4b24679](https://github.com/mnahkies/openapi-code-generator/commit/4b24679e69ee2d5555419549ec00f399c53d8e78))
- support application/octet-stream (Blob) req/res bodies ([#359](https://github.com/mnahkies/openapi-code-generator/issues/359)) ([b043ead](https://github.com/mnahkies/openapi-code-generator/commit/b043eadd4893a6aa782a33fca84aaa64c5189e78))

### BREAKING CHANGES

- `Response` exported from the runtime packages is now
  exported as `Res`, regenerating should adjust
- deprecated exports removed, regenerate using the latest
  cli to avoid issues

# [0.22.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.22.0-alpha.0...v0.22.0) (2025-11-02)

**Note:** Version bump only for package @nahkies/typescript-express-runtime

# [0.22.0-alpha.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.21.1...v0.22.0-alpha.0) (2025-10-26)

- feat!: support both zod v3 and zod v4 (#366) ([f7e374f](https://github.com/mnahkies/openapi-code-generator/commit/f7e374fd3c5193e57e71caf5aa6b51b6558ed1f0)), closes [#366](https://github.com/mnahkies/openapi-code-generator/issues/366)

### BREAKING CHANGES

- default schema builder now `zod-v4`, pass `zod-v3` to
  continue using `zod@^3`

## [0.21.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.21.0...v0.21.1) (2025-08-13)

**Note:** Version bump only for package @nahkies/typescript-express-runtime

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
