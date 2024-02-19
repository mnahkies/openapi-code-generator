# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.6.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.5.0...v0.6.0) (2024-02-19)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime





# [0.5.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.4.0...v0.5.0) (2024-02-10)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime





# [0.4.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.3.0...v0.4.0) (2024-01-05)


### Bug Fixes

* incorrect .d.ts path for zod ([#119](https://github.com/mnahkies/openapi-code-generator/issues/119)) ([f0d737d](https://github.com/mnahkies/openapi-code-generator/commit/f0d737dbafff29f5e5ab573bb68ed7ac03eef5ef)), closes [#117](https://github.com/mnahkies/openapi-code-generator/issues/117)


### Features

* **typescript-koa:** introduce optional "respond" pattern ([c6595a1](https://github.com/mnahkies/openapi-code-generator/commit/c6595a118dcd37bf81b3c22a7f3ddc760a5cf113))





# [0.3.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.2.0...v0.3.0) (2023-12-02)


* feat!: throw discriminable errors indicating point of failure (#95) ([4badd41](https://github.com/mnahkies/openapi-code-generator/commit/4badd4114b1c19e73631b48610751f9229f436c8)), closes [#95](https://github.com/mnahkies/openapi-code-generator/issues/95) [/github.com/mnahkies/openapi-code-generator/pull/95/files#diff-b82e27c39ae18163c6d5547d0bf1c5dd9a92302ae047f160a76ea0c7af5ad7b0](https://github.com//github.com/mnahkies/openapi-code-generator/pull/95/files/issues/diff-b82e27c39ae18163c6d5547d0bf1c5dd9a92302ae047f160a76ea0c7af5ad7b0)


### BREAKING CHANGES

* ** errors thrown are now wrapped in `KoaRuntimeError`
objects.





# [0.2.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.1...v0.2.0) (2023-11-12)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime





## [0.1.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.0...v0.1.1) (2023-11-11)

**Note:** Version bump only for package @nahkies/typescript-koa-runtime





# 0.1.0 (2023-10-01)


### Bug Fixes

* remove unused, tidy ups ([0be1033](https://github.com/mnahkies/openapi-code-generator/commit/0be1033c48302f5c0d3ae7cdfe9447e635f11cd6))


### Features

* config flag to switch schema parser ([#39](https://github.com/mnahkies/openapi-code-generator/issues/39)) ([336e923](https://github.com/mnahkies/openapi-code-generator/commit/336e923b3e25aeb63307c70d430e0fd68f553e67)), closes [#13](https://github.com/mnahkies/openapi-code-generator/issues/13)
* move more static code into koa runtime ([#21](https://github.com/mnahkies/openapi-code-generator/issues/21)) ([0b175af](https://github.com/mnahkies/openapi-code-generator/commit/0b175afebcb394a381326b38827308578e4f907c))
* move static code to normal files ([#20](https://github.com/mnahkies/openapi-code-generator/issues/20)) ([2897680](https://github.com/mnahkies/openapi-code-generator/commit/2897680d8429466984724a2980f1b250fde851e7))
* overhaul docs / publish to npm ([#75](https://github.com/mnahkies/openapi-code-generator/issues/75)) ([f9386ab](https://github.com/mnahkies/openapi-code-generator/commit/f9386ab74ef3e7c6eff7040bd86d4efeccdfd868))
* response body validation and types ([#29](https://github.com/mnahkies/openapi-code-generator/issues/29)) ([ffc8f20](https://github.com/mnahkies/openapi-code-generator/commit/ffc8f20487c11f339d08c2493ba68b23fea041f9)), closes [#11](https://github.com/mnahkies/openapi-code-generator/issues/11)
* rework input schema parsing ([#25](https://github.com/mnahkies/openapi-code-generator/issues/25)) ([7bae0ad](https://github.com/mnahkies/openapi-code-generator/commit/7bae0ad0c5c3d49ab172df44f5ae1b4332aaa8be))
