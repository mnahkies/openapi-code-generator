# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.1.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.0...v0.1.1) (2023-11-11)


### Bug Fixes

* don't coerce strings ([e579295](https://github.com/mnahkies/openapi-code-generator/commit/e57929559a351f3c48590e19c4be8b115ba6de8d))





# 0.1.0 (2023-10-01)


### Bug Fixes

* avoid type conflict between jasmine and mocha ([bc471ca](https://github.com/mnahkies/openapi-code-generator/commit/bc471caed434717adb53c13379f6e3f9891e1d29))
* dependency graph handles oneOf allOf nesting ([#73](https://github.com/mnahkies/openapi-code-generator/issues/73)) ([52ca608](https://github.com/mnahkies/openapi-code-generator/commit/52ca608368c0af31573b707a2621647859823d7e))
* eslint disable in generated files ([#30](https://github.com/mnahkies/openapi-code-generator/issues/30)) ([1ee33c4](https://github.com/mnahkies/openapi-code-generator/commit/1ee33c4d181a16d43e3a7d81f75db2ea6662e963)), closes [/eslint.org/docs/latest/use/configure/rules#using-configuration-comments-1](https://github.com//eslint.org/docs/latest/use/configure/rules/issues/using-configuration-comments-1)
* implicit any ([74952a7](https://github.com/mnahkies/openapi-code-generator/commit/74952a744b5ed9eba05ffd9a46bdc7ea75cd7683))
* improve null support ([#40](https://github.com/mnahkies/openapi-code-generator/issues/40)) ([c2c3c1f](https://github.com/mnahkies/openapi-code-generator/commit/c2c3c1f4c23e65e71d624e59186a4fb07072f315))
* improve support for nullable types ([#33](https://github.com/mnahkies/openapi-code-generator/issues/33)) ([bedfee0](https://github.com/mnahkies/openapi-code-generator/commit/bedfee015f2af2a638c0afe2fcca00523f670060))
* improve validation to switch between 3.1.0 / 3.0.0 ([#34](https://github.com/mnahkies/openapi-code-generator/issues/34)) ([915456f](https://github.com/mnahkies/openapi-code-generator/commit/915456fa281181652b831d036c65a0387c6cf58b))
* lint ([fe704fa](https://github.com/mnahkies/openapi-code-generator/commit/fe704fa3bd5ef093f244b2d8de05e20e92749c43))
* lint errors ([92a69a8](https://github.com/mnahkies/openapi-code-generator/commit/92a69a88e35f7a79804a9444cfc1e195b08e4c0c))
* logger goes straight to stdout/stderr ([0c39a04](https://github.com/mnahkies/openapi-code-generator/commit/0c39a04ad26fe5b7a62f8b8e8188d4a6ad233cf3))
* plumb through middleware ([#80](https://github.com/mnahkies/openapi-code-generator/issues/80)) ([d02813e](https://github.com/mnahkies/openapi-code-generator/commit/d02813efa3480a0cd827bfd1a7fa191450307374))
* remove broken functionality ([#78](https://github.com/mnahkies/openapi-code-generator/issues/78)) ([3e5dad1](https://github.com/mnahkies/openapi-code-generator/commit/3e5dad197d893eef847686d6ccfa19f046d7308e))
* remove unused, tidy ups ([0be1033](https://github.com/mnahkies/openapi-code-generator/commit/0be1033c48302f5c0d3ae7cdfe9447e635f11cd6))
* replace . in identifiers ([#50](https://github.com/mnahkies/openapi-code-generator/issues/50)) ([ac4ce9b](https://github.com/mnahkies/openapi-code-generator/commit/ac4ce9b5a0ca9d0873f3c02aecaa96c4edbeed81))
* request bodies can be optional ([#24](https://github.com/mnahkies/openapi-code-generator/issues/24)) ([810619c](https://github.com/mnahkies/openapi-code-generator/commit/810619c0063606ddfc295ba2e9d2bf0a80938bb7))
* respect optional $ref properties ([#22](https://github.com/mnahkies/openapi-code-generator/issues/22)) ([32e80d8](https://github.com/mnahkies/openapi-code-generator/commit/32e80d8f11e1d60cd3dddbfd9805209c6acf654e))
* share requestBodyAsParameter implementation ([2f7477b](https://github.com/mnahkies/openapi-code-generator/commit/2f7477b0595d8ab3389a5910cd639b1cc4feefa6))
* surface status code -> body relationship in angular template ([#63](https://github.com/mnahkies/openapi-code-generator/issues/63)) ([7b1ffe9](https://github.com/mnahkies/openapi-code-generator/commit/7b1ffe916742ac2a8ebf90c769df20b24f4f3769))
* switch to qs and add tests for query string ([#56](https://github.com/mnahkies/openapi-code-generator/issues/56)) ([dbcec86](https://github.com/mnahkies/openapi-code-generator/commit/dbcec86d19932a1ed3180934bebea811c240aff7))
* typescript-fetch mostly generating ([e798731](https://github.com/mnahkies/openapi-code-generator/commit/e7987318c59a4c136cad4833097b7912e993ccdf))
* **typescript-fetch:** omit optional query params ([#2](https://github.com/mnahkies/openapi-code-generator/issues/2)) ([fd10e9b](https://github.com/mnahkies/openapi-code-generator/commit/fd10e9b72a93e1e7e472de96f1cc9d340db63af4))
* use built-in / global fetch ([44eb83e](https://github.com/mnahkies/openapi-code-generator/commit/44eb83e6007ec379860048f7b45bb3d278fa8d69))
* use merge instead of intersection ([#28](https://github.com/mnahkies/openapi-code-generator/issues/28)) ([062455a](https://github.com/mnahkies/openapi-code-generator/commit/062455a50bbd6eb2b8cd1b902ec2c3565b7b0cba))
* use request body ([#32](https://github.com/mnahkies/openapi-code-generator/issues/32)) ([c0eba77](https://github.com/mnahkies/openapi-code-generator/commit/c0eba77fb9b30a7c32a6a1bfec9ed93a5ce7d739))


### Features

* better support for additional properties ([#57](https://github.com/mnahkies/openapi-code-generator/issues/57)) ([e69881b](https://github.com/mnahkies/openapi-code-generator/commit/e69881b5e682d6799528a0b0b49dbb3b669dc7d1))
* clients default params to {} when none are required ([#36](https://github.com/mnahkies/openapi-code-generator/issues/36)) ([1ffdc52](https://github.com/mnahkies/openapi-code-generator/commit/1ffdc52f8c2b5358d59346c0eb54032a0708b4b5))
* config flag to switch schema parser ([#39](https://github.com/mnahkies/openapi-code-generator/issues/39)) ([336e923](https://github.com/mnahkies/openapi-code-generator/commit/336e923b3e25aeb63307c70d430e0fd68f553e67)), closes [#13](https://github.com/mnahkies/openapi-code-generator/issues/13)
* fetch client supports abort signals ([#65](https://github.com/mnahkies/openapi-code-generator/issues/65)) ([e646771](https://github.com/mnahkies/openapi-code-generator/commit/e646771a75643e8b53525ef9693c082ab372c22d))
* improve client generation ([#35](https://github.com/mnahkies/openapi-code-generator/issues/35)) ([48a806a](https://github.com/mnahkies/openapi-code-generator/commit/48a806a18480565e4299f2b37555bf630f864258))
* initial support for anyOf ([#55](https://github.com/mnahkies/openapi-code-generator/issues/55)) ([a61cbb9](https://github.com/mnahkies/openapi-code-generator/commit/a61cbb92a6a656a81b6c52b65ebd51c473f2c48a)), closes [#46](https://github.com/mnahkies/openapi-code-generator/issues/46)
* initial support for oneOf ([#23](https://github.com/mnahkies/openapi-code-generator/issues/23)) ([1619bf7](https://github.com/mnahkies/openapi-code-generator/commit/1619bf781b6b1f623a37ec2a7cde2ed2990bec06))
* move more static code into koa runtime ([#21](https://github.com/mnahkies/openapi-code-generator/issues/21)) ([0b175af](https://github.com/mnahkies/openapi-code-generator/commit/0b175afebcb394a381326b38827308578e4f907c))
* move static code to normal files ([#20](https://github.com/mnahkies/openapi-code-generator/issues/20)) ([2897680](https://github.com/mnahkies/openapi-code-generator/commit/2897680d8429466984724a2980f1b250fde851e7))
* new approach to server stubs ([#9](https://github.com/mnahkies/openapi-code-generator/issues/9)) ([aff4835](https://github.com/mnahkies/openapi-code-generator/commit/aff48352dc7244175bc9abaacc6412f3c288e895))
* order schemas correctly ([#37](https://github.com/mnahkies/openapi-code-generator/issues/37)) ([9f899dd](https://github.com/mnahkies/openapi-code-generator/commit/9f899dd641f7ff20a21556a1851802129866b412))
* overhaul docs / publish to npm ([#75](https://github.com/mnahkies/openapi-code-generator/issues/75)) ([f9386ab](https://github.com/mnahkies/openapi-code-generator/commit/f9386ab74ef3e7c6eff7040bd86d4efeccdfd868))
* response body validation and types ([#29](https://github.com/mnahkies/openapi-code-generator/issues/29)) ([ffc8f20](https://github.com/mnahkies/openapi-code-generator/commit/ffc8f20487c11f339d08c2493ba68b23fea041f9)), closes [#11](https://github.com/mnahkies/openapi-code-generator/issues/11)
* rework input schema parsing ([#25](https://github.com/mnahkies/openapi-code-generator/issues/25)) ([7bae0ad](https://github.com/mnahkies/openapi-code-generator/commit/7bae0ad0c5c3d49ab172df44f5ae1b4332aaa8be))
* support circular references ([#58](https://github.com/mnahkies/openapi-code-generator/issues/58)) ([48f8d89](https://github.com/mnahkies/openapi-code-generator/commit/48f8d89f668edcd98d37146ac8763fbc71953049)), closes [#49](https://github.com/mnahkies/openapi-code-generator/issues/49)
* support loading from literal ([5e47ed0](https://github.com/mnahkies/openapi-code-generator/commit/5e47ed0b10efc24c267112cafe77a120388d58b4))
* support string enums in zod parsing ([efe2e2e](https://github.com/mnahkies/openapi-code-generator/commit/efe2e2e116dbd87198d647e8dfaddade311320b8))
* support zod for parsing inputs ([e0c1b88](https://github.com/mnahkies/openapi-code-generator/commit/e0c1b88b9dec1946566696ea367933cb48ba9d2b))
* use commander for cli args for better ux ([#76](https://github.com/mnahkies/openapi-code-generator/issues/76)) ([26d7401](https://github.com/mnahkies/openapi-code-generator/commit/26d7401cb635bdf7b3f0b649adc7f792a5710ad6))
* zod schema builder supports allOf ([#27](https://github.com/mnahkies/openapi-code-generator/issues/27)) ([b09fcc9](https://github.com/mnahkies/openapi-code-generator/commit/b09fcc957116555953c96723db3aafdff094b92e))
