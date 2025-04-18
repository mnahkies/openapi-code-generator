# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.19.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.19.0...v0.19.1) (2025-04-18)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.19.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.18.0...v0.19.0) (2025-04-18)

### Bug Fixes

- joi array query params ([#309](https://github.com/mnahkies/openapi-code-generator/issues/309)) ([aba104e](https://github.com/mnahkies/openapi-code-generator/commit/aba104e484f463b180a9939d00ccddb55c1848aa))

# [0.18.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.17.0...v0.18.0) (2024-12-22)

- fix(joi)!: switch from @hapi/joi to joi (#284) ([6693e1d](https://github.com/mnahkies/openapi-code-generator/commit/6693e1de7b635bf99b3b41a1f41f66932697d416)), closes [#284](https://github.com/mnahkies/openapi-code-generator/issues/284)

### BREAKING CHANGES

- `peerDependency` changed to `joi` for users of
  `--schema-builder joi`

# [0.17.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.16.0...v0.17.0) (2024-12-11)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.16.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.15.0...v0.16.0) (2024-11-02)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.15.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.14.0...v0.15.0) (2024-10-27)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.14.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.13.0...v0.14.0) (2024-10-12)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.13.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.12.1...v0.13.0) (2024-09-20)

- feat!: parse/validate request headers (#247) ([682d0c9](https://github.com/mnahkies/openapi-code-generator/commit/682d0c9f081400a0465ff8aa391c85a85e3e8462)), closes [#247](https://github.com/mnahkies/openapi-code-generator/issues/247)

### BREAKING CHANGES

- requests receiving incorrect request header parameters
  will now fail with a validation error

## [0.12.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.12.0...v0.12.1) (2024-08-17)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.12.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.11.2...v0.12.0) (2024-08-05)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

## [0.11.2](https://github.com/mnahkies/openapi-code-generator/compare/v0.11.1...v0.11.2) (2024-07-29)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

## [0.11.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.11.0...v0.11.1) (2024-07-27)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.11.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.10.0...v0.11.0) (2024-06-08)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.10.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.9.0...v0.10.0) (2024-05-25)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.9.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.8.0...v0.9.0) (2024-04-27)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.8.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.7.0...v0.8.0) (2024-04-07)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.7.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.6.0...v0.7.0) (2024-03-03)

### Features

- adopt biome for code formatting ([#129](https://github.com/mnahkies/openapi-code-generator/issues/129)) ([b75bc65](https://github.com/mnahkies/openapi-code-generator/commit/b75bc650287bfa8801d634dece70c4eed3fb91d5))

# [0.6.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.5.0...v0.6.0) (2024-02-19)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.5.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.4.0...v0.5.0) (2024-02-10)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# [0.4.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.3.0...v0.4.0) (2024-01-05)

### Bug Fixes

- incorrect .d.ts path for zod ([#119](https://github.com/mnahkies/openapi-code-generator/issues/119)) ([f0d737d](https://github.com/mnahkies/openapi-code-generator/commit/f0d737dbafff29f5e5ab573bb68ed7ac03eef5ef)), closes [#117](https://github.com/mnahkies/openapi-code-generator/issues/117)

### Features

- **typescript-koa:** introduce optional "respond" pattern ([c6595a1](https://github.com/mnahkies/openapi-code-generator/commit/c6595a118dcd37bf81b3c22a7f3ddc760a5cf113))

# [0.3.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.2.0...v0.3.0) (2023-12-02)

- feat!: throw discriminable errors indicating point of failure (#95) ([4badd41](https://github.com/mnahkies/openapi-code-generator/commit/4badd4114b1c19e73631b48610751f9229f436c8)), closes [#95](https://github.com/mnahkies/openapi-code-generator/issues/95) [/github.com/mnahkies/openapi-code-generator/pull/95/files#diff-b82e27c39ae18163c6d5547d0bf1c5dd9a92302ae047f160a76ea0c7af5ad7b0](https://github.com//github.com/mnahkies/openapi-code-generator/pull/95/files/issues/diff-b82e27c39ae18163c6d5547d0bf1c5dd9a92302ae047f160a76ea0c7af5ad7b0)

### BREAKING CHANGES

- \*\* errors thrown are now wrapped in `KoaRuntimeError`
  objects.

# [0.2.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.1...v0.2.0) (2023-11-12)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

## [0.1.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.0...v0.1.1) (2023-11-11)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime

# 0.1.0 (2023-10-01)

### Bug Fixes

- remove unused, tidy ups ([0be1033](https://github.com/mnahkies/openapi-code-generator/commit/0be1033c48302f5c0d3ae7cdfe9447e635f11cd6))

### Features

- config flag to switch schema parser ([#39](https://github.com/mnahkies/openapi-code-generator/issues/39)) ([336e923](https://github.com/mnahkies/openapi-code-generator/commit/336e923b3e25aeb63307c70d430e0fd68f553e67)), closes [#13](https://github.com/mnahkies/openapi-code-generator/issues/13)
- move more static code into koa runtime ([#21](https://github.com/mnahkies/openapi-code-generator/issues/21)) ([0b175af](https://github.com/mnahkies/openapi-code-generator/commit/0b175afebcb394a381326b38827308578e4f907c))
- move static code to normal files ([#20](https://github.com/mnahkies/openapi-code-generator/issues/20)) ([2897680](https://github.com/mnahkies/openapi-code-generator/commit/2897680d8429466984724a2980f1b250fde851e7))
- overhaul docs / publish to npm ([#75](https://github.com/mnahkies/openapi-code-generator/issues/75)) ([f9386ab](https://github.com/mnahkies/openapi-code-generator/commit/f9386ab74ef3e7c6eff7040bd86d4efeccdfd868))
- response body validation and types ([#29](https://github.com/mnahkies/openapi-code-generator/issues/29)) ([ffc8f20](https://github.com/mnahkies/openapi-code-generator/commit/ffc8f20487c11f339d08c2493ba68b23fea041f9)), closes [#11](https://github.com/mnahkies/openapi-code-generator/issues/11)
- rework input schema parsing ([#25](https://github.com/mnahkies/openapi-code-generator/issues/25)) ([7bae0ad](https://github.com/mnahkies/openapi-code-generator/commit/7bae0ad0c5c3d49ab172df44f5ae1b4332aaa8be))
