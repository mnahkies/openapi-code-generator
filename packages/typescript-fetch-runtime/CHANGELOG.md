# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.19.2](https://github.com/mnahkies/openapi-code-generator/compare/v0.19.1...v0.19.2) (2025-04-19)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

## [0.19.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.19.0...v0.19.1) (2025-04-18)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.19.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.18.0...v0.19.0) (2025-04-18)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.18.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.17.0...v0.18.0) (2024-12-22)

### Bug Fixes

- **typescript-fetch:** runtime validation works ([#287](https://github.com/mnahkies/openapi-code-generator/issues/287)) ([cead53a](https://github.com/mnahkies/openapi-code-generator/commit/cead53a25272764b012925115d247eb5cd619d49)), closes [#286](https://github.com/mnahkies/openapi-code-generator/issues/286)

- fix(joi)!: switch from @hapi/joi to joi (#284) ([6693e1d](https://github.com/mnahkies/openapi-code-generator/commit/6693e1de7b635bf99b3b41a1f41f66932697d416)), closes [#284](https://github.com/mnahkies/openapi-code-generator/issues/284)
- feat(typescript-fetch)!: simplify response types (#280) ([4340caf](https://github.com/mnahkies/openapi-code-generator/commit/4340caf009684a9034d1b90e4dc4753ab174e131)), closes [#280](https://github.com/mnahkies/openapi-code-generator/issues/280)

### BREAKING CHANGES

- `peerDependency` changed to `joi` for users of
  `--schema-builder joi`
- `TypedFetchResponse` is removed, use `Res` directly if
  needed

# [0.17.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.16.0...v0.17.0) (2024-12-11)

### Features

- defaultHeaders is optional ([#274](https://github.com/mnahkies/openapi-code-generator/issues/274)) ([fc7cc62](https://github.com/mnahkies/openapi-code-generator/commit/fc7cc62cf26d84543606fb52b0a8edaa61655046))
- support servers at path / operation level + variables ([#272](https://github.com/mnahkies/openapi-code-generator/issues/272)) ([969ca68](https://github.com/mnahkies/openapi-code-generator/commit/969ca68e9e069a80b42d6a050cfd7a8cdbbfeb91))

# [0.16.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.15.0...v0.16.0) (2024-11-02)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.15.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.14.0...v0.15.0) (2024-10-27)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.14.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.13.0...v0.14.0) (2024-10-12)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.13.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.12.1...v0.13.0) (2024-09-20)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

## [0.12.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.12.0...v0.12.1) (2024-08-17)

### Bug Fixes

- allow number array query param ([#236](https://github.com/mnahkies/openapi-code-generator/issues/236)) ([3ace597](https://github.com/mnahkies/openapi-code-generator/commit/3ace597489bde7103bc8b3fbae6f11238c5c3fdf)), closes [#235](https://github.com/mnahkies/openapi-code-generator/issues/235)
- **fetch/axios:** correctly merge headers from opts ([#231](https://github.com/mnahkies/openapi-code-generator/issues/231)) ([5efc36e](https://github.com/mnahkies/openapi-code-generator/commit/5efc36e5c15d3995c46486677ccce680a5c95602))

# [0.12.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.11.2...v0.12.0) (2024-08-05)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

## [0.11.2](https://github.com/mnahkies/openapi-code-generator/compare/v0.11.1...v0.11.2) (2024-07-29)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

## [0.11.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.11.0...v0.11.1) (2024-07-27)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.11.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.10.0...v0.11.0) (2024-06-08)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.10.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.9.0...v0.10.0) (2024-05-25)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.9.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.8.0...v0.9.0) (2024-04-27)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.8.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.7.0...v0.8.0) (2024-04-07)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.7.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.6.0...v0.7.0) (2024-03-03)

### Features

- use strict typescript settings ([#131](https://github.com/mnahkies/openapi-code-generator/issues/131)) ([39758e2](https://github.com/mnahkies/openapi-code-generator/commit/39758e2f23d24adde3218e6ce32863e0fd587f7d)), closes [#129](https://github.com/mnahkies/openapi-code-generator/issues/129)

# [0.6.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.5.0...v0.6.0) (2024-02-19)

### Features

- support response validation for joi ([#127](https://github.com/mnahkies/openapi-code-generator/issues/127)) ([30f22a8](https://github.com/mnahkies/openapi-code-generator/commit/30f22a87b6465d251e1154216f708ea4fb9d5dc3)), closes [#112](https://github.com/mnahkies/openapi-code-generator/issues/112)

# [0.5.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.4.0...v0.5.0) (2024-02-10)

### Features

- client generators support experimental runtime response validation ([#112](https://github.com/mnahkies/openapi-code-generator/issues/112)) ([f3c3610](https://github.com/mnahkies/openapi-code-generator/commit/f3c361074db22d3de0db044d34cffd2e36772429)), closes [#82](https://github.com/mnahkies/openapi-code-generator/issues/82)

# [0.4.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.3.0...v0.4.0) (2024-01-05)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.3.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.2.0...v0.3.0) (2023-12-02)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# [0.2.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.1...v0.2.0) (2023-11-12)

### Bug Fixes

- allow numeric header values ([#105](https://github.com/mnahkies/openapi-code-generator/issues/105)) ([7feab98](https://github.com/mnahkies/openapi-code-generator/commit/7feab98733584221c28dd1f9b8e1f3097d58e28f))

## [0.1.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.0...v0.1.1) (2023-11-11)

**Note:** Version bump only for package @nahkies/typescript-fetch-runtime

# 0.1.0 (2023-10-01)

### Bug Fixes

- remove broken functionality ([#78](https://github.com/mnahkies/openapi-code-generator/issues/78)) ([3e5dad1](https://github.com/mnahkies/openapi-code-generator/commit/3e5dad197d893eef847686d6ccfa19f046d7308e))
- switch to qs and add tests for query string ([#56](https://github.com/mnahkies/openapi-code-generator/issues/56)) ([dbcec86](https://github.com/mnahkies/openapi-code-generator/commit/dbcec86d19932a1ed3180934bebea811c240aff7))

### Features

- fetch client supports abort signals ([#65](https://github.com/mnahkies/openapi-code-generator/issues/65)) ([e646771](https://github.com/mnahkies/openapi-code-generator/commit/e646771a75643e8b53525ef9693c082ab372c22d))
- improve client generation ([#35](https://github.com/mnahkies/openapi-code-generator/issues/35)) ([48a806a](https://github.com/mnahkies/openapi-code-generator/commit/48a806a18480565e4299f2b37555bf630f864258))
- overhaul docs / publish to npm ([#75](https://github.com/mnahkies/openapi-code-generator/issues/75)) ([f9386ab](https://github.com/mnahkies/openapi-code-generator/commit/f9386ab74ef3e7c6eff7040bd86d4efeccdfd868))
