# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.6.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.5.0...v0.6.0) (2024-02-19)


### Features

* improve additional properties support ([#126](https://github.com/mnahkies/openapi-code-generator/issues/126)) ([7a8c289](https://github.com/mnahkies/openapi-code-generator/commit/7a8c289e7aa242ee700553f23244be3676579ebc)), closes [#125](https://github.com/mnahkies/openapi-code-generator/issues/125) [#44](https://github.com/mnahkies/openapi-code-generator/issues/44)
* support response validation for joi ([#127](https://github.com/mnahkies/openapi-code-generator/issues/127)) ([30f22a8](https://github.com/mnahkies/openapi-code-generator/commit/30f22a87b6465d251e1154216f708ea4fb9d5dc3)), closes [#112](https://github.com/mnahkies/openapi-code-generator/issues/112)





# [0.5.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.4.0...v0.5.0) (2024-02-10)


### Bug Fixes

* use RouterContext rather than plain Context ([a13c1b7](https://github.com/mnahkies/openapi-code-generator/commit/a13c1b76522c5bdf172229e88b02be1390286fd0))


### Features

* client generators support experimental runtime response validation ([#112](https://github.com/mnahkies/openapi-code-generator/issues/112)) ([f3c3610](https://github.com/mnahkies/openapi-code-generator/commit/f3c361074db22d3de0db044d34cffd2e36772429)), closes [#82](https://github.com/mnahkies/openapi-code-generator/issues/82)
* experimental support for extracting inline schemas ([#123](https://github.com/mnahkies/openapi-code-generator/issues/123)) ([1c11d77](https://github.com/mnahkies/openapi-code-generator/commit/1c11d778f4aa19451e5d8c3271d45a8dc9d12070))





# [0.4.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.3.0...v0.4.0) (2024-01-05)


### Bug Fixes

* incorrect .d.ts path for zod ([#119](https://github.com/mnahkies/openapi-code-generator/issues/119)) ([f0d737d](https://github.com/mnahkies/openapi-code-generator/commit/f0d737dbafff29f5e5ab573bb68ed7ac03eef5ef)), closes [#117](https://github.com/mnahkies/openapi-code-generator/issues/117)
* **koa:** don't camel-case route placeholders ([#120](https://github.com/mnahkies/openapi-code-generator/issues/120)) ([59e1438](https://github.com/mnahkies/openapi-code-generator/commit/59e1438d1f01cd505cb5f93de6cb4937a5133e20)), closes [#118](https://github.com/mnahkies/openapi-code-generator/issues/118) [#118](https://github.com/mnahkies/openapi-code-generator/issues/118)


### Features

* **typescript-koa:** introduce optional "respond" pattern ([c6595a1](https://github.com/mnahkies/openapi-code-generator/commit/c6595a118dcd37bf81b3c22a7f3ddc760a5cf113))





# [0.3.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.2.0...v0.3.0) (2023-12-02)


### Bug Fixes

* decouple schema builders from typescript-koa ([#113](https://github.com/mnahkies/openapi-code-generator/issues/113)) ([f75a80c](https://github.com/mnahkies/openapi-code-generator/commit/f75a80c9cad7cd1b11a282f542fd05b0fb2d2c86)), closes [#112](https://github.com/mnahkies/openapi-code-generator/issues/112)


* feat!: throw discriminable errors indicating point of failure (#95) ([4badd41](https://github.com/mnahkies/openapi-code-generator/commit/4badd4114b1c19e73631b48610751f9229f436c8)), closes [#95](https://github.com/mnahkies/openapi-code-generator/issues/95) [/github.com/mnahkies/openapi-code-generator/pull/95/files#diff-b82e27c39ae18163c6d5547d0bf1c5dd9a92302ae047f160a76ea0c7af5ad7b0](https://github.com//github.com/mnahkies/openapi-code-generator/pull/95/files/issues/diff-b82e27c39ae18163c6d5547d0bf1c5dd9a92302ae047f160a76ea0c7af5ad7b0)


### Features

* add typescript-axios template ([#83](https://github.com/mnahkies/openapi-code-generator/issues/83)) ([c3e045d](https://github.com/mnahkies/openapi-code-generator/commit/c3e045d446e2af9f75f5724a19b58c212376751f))
* include schema builder in client generators ([#114](https://github.com/mnahkies/openapi-code-generator/issues/114)) ([9beb268](https://github.com/mnahkies/openapi-code-generator/commit/9beb2682fdc724871206d18a2c678e56d7c6238b)), closes [#112](https://github.com/mnahkies/openapi-code-generator/issues/112)


### BREAKING CHANGES

* ** errors thrown are now wrapped in `KoaRuntimeError`
objects.





# [0.2.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.1...v0.2.0) (2023-11-12)


### Bug Fixes

* allow numeric header values ([#105](https://github.com/mnahkies/openapi-code-generator/issues/105)) ([7feab98](https://github.com/mnahkies/openapi-code-generator/commit/7feab98733584221c28dd1f9b8e1f3097d58e28f))
* handle `"` in string enum values ([#107](https://github.com/mnahkies/openapi-code-generator/issues/107)) ([5b2c341](https://github.com/mnahkies/openapi-code-generator/commit/5b2c341a9a240a62e66c3eda49e80fd36b7c50a1)), closes [/github.com/APIs-guru/openapi-directory/blob/dec74da7a6785d5d5b83bc6a4cebc07336d67ec9/APIs/vercel.com/0.0.1/openapi.yaml#L4810](https://github.com//github.com/APIs-guru/openapi-directory/blob/dec74da7a6785d5d5b83bc6a4cebc07336d67ec9/APIs/vercel.com/0.0.1/openapi.yaml/issues/L4810)
* handle null in enums ([#106](https://github.com/mnahkies/openapi-code-generator/issues/106)) ([b235a7e](https://github.com/mnahkies/openapi-code-generator/commit/b235a7ead75a7655073e67b30a94c980eb9c81ef)), closes [/github.com/APIs-guru/openapi-directory/blob/dec74da7a6785d5d5b83bc6a4cebc07336d67ec9/APIs/vercel.com/0.0.1/openapi.yaml#L4648-L4655](https://github.com//github.com/APIs-guru/openapi-directory/blob/dec74da7a6785d5d5b83bc6a4cebc07336d67ec9/APIs/vercel.com/0.0.1/openapi.yaml/issues/L4648-L4655)
* optional oneOf / allOf / anyOf / $ref's ([#110](https://github.com/mnahkies/openapi-code-generator/issues/110)) ([2ff114a](https://github.com/mnahkies/openapi-code-generator/commit/2ff114ad60df1ab24085d4d6f9ab23e11c2fdd0c))
* skip broken openapi 3.1 validation for now ([#104](https://github.com/mnahkies/openapi-code-generator/issues/104)) ([f6e7956](https://github.com/mnahkies/openapi-code-generator/commit/f6e795629caa2adf9b00d53b2a771134135afdc8)), closes [#103](https://github.com/mnahkies/openapi-code-generator/issues/103)
* use numerical enums when creating zod schema ([#108](https://github.com/mnahkies/openapi-code-generator/issues/108)) ([7564c10](https://github.com/mnahkies/openapi-code-generator/commit/7564c10c730d008629a45f46d1cc074ba225e429)), closes [/github.com/colinhacks/zod/issues/2686#issuecomment-1807096385](https://github.com//github.com/colinhacks/zod/issues/2686/issues/issuecomment-1807096385)


### Features

* basic support for openapi 3.1 ([#109](https://github.com/mnahkies/openapi-code-generator/issues/109)) ([60838d9](https://github.com/mnahkies/openapi-code-generator/commit/60838d93ac8e672f2227d399b3926da17073385e))





## [0.1.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.0...v0.1.1) (2023-11-11)


### Bug Fixes

* avoid warning for non-nullable paths ([#90](https://github.com/mnahkies/openapi-code-generator/issues/90)) ([b857182](https://github.com/mnahkies/openapi-code-generator/commit/b8571820109ca31e836b7141f5aac5a88919096b))
* delete files missed in [#92](https://github.com/mnahkies/openapi-code-generator/issues/92) ([#93](https://github.com/mnahkies/openapi-code-generator/issues/93)) ([9ccdd50](https://github.com/mnahkies/openapi-code-generator/commit/9ccdd50a30e6b726ea59c46396929fd0220a3aa6))
* don't coerce strings ([e579295](https://github.com/mnahkies/openapi-code-generator/commit/e57929559a351f3c48590e19c4be8b115ba6de8d))
* unused imports ([#97](https://github.com/mnahkies/openapi-code-generator/issues/97)) ([c2a0ae5](https://github.com/mnahkies/openapi-code-generator/commit/c2a0ae50e2ff9e81181f032ca514a1e974f08321))





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
* master -> main ([#77](https://github.com/mnahkies/openapi-code-generator/issues/77)) ([dade840](https://github.com/mnahkies/openapi-code-generator/commit/dade840c94c0e5e1f47c02440f6e9fb776cceea7))
* plumb through middleware ([#80](https://github.com/mnahkies/openapi-code-generator/issues/80)) ([d02813e](https://github.com/mnahkies/openapi-code-generator/commit/d02813efa3480a0cd827bfd1a7fa191450307374))
* remove broken functionality ([#78](https://github.com/mnahkies/openapi-code-generator/issues/78)) ([3e5dad1](https://github.com/mnahkies/openapi-code-generator/commit/3e5dad197d893eef847686d6ccfa19f046d7308e))
* remove unused, tidy ups ([0be1033](https://github.com/mnahkies/openapi-code-generator/commit/0be1033c48302f5c0d3ae7cdfe9447e635f11cd6))
* replace . in identifiers ([#50](https://github.com/mnahkies/openapi-code-generator/issues/50)) ([ac4ce9b](https://github.com/mnahkies/openapi-code-generator/commit/ac4ce9b5a0ca9d0873f3c02aecaa96c4edbeed81))
* request bodies can be optional ([#24](https://github.com/mnahkies/openapi-code-generator/issues/24)) ([810619c](https://github.com/mnahkies/openapi-code-generator/commit/810619c0063606ddfc295ba2e9d2bf0a80938bb7))
* respect optional $ref properties ([#22](https://github.com/mnahkies/openapi-code-generator/issues/22)) ([32e80d8](https://github.com/mnahkies/openapi-code-generator/commit/32e80d8f11e1d60cd3dddbfd9805209c6acf654e))
* share requestBodyAsParameter implementation ([2f7477b](https://github.com/mnahkies/openapi-code-generator/commit/2f7477b0595d8ab3389a5910cd639b1cc4feefa6))
* stop angular integration tests building with packages ([feb776d](https://github.com/mnahkies/openapi-code-generator/commit/feb776db56e4900514cf8ccee33aa47176bef093))
* surface status code -> body relationship in angular template ([#63](https://github.com/mnahkies/openapi-code-generator/issues/63)) ([7b1ffe9](https://github.com/mnahkies/openapi-code-generator/commit/7b1ffe916742ac2a8ebf90c769df20b24f4f3769))
* switch to qs and add tests for query string ([#56](https://github.com/mnahkies/openapi-code-generator/issues/56)) ([dbcec86](https://github.com/mnahkies/openapi-code-generator/commit/dbcec86d19932a1ed3180934bebea811c240aff7))
* try using wildcard version to work around lerna publish bug ([#84](https://github.com/mnahkies/openapi-code-generator/issues/84)) ([e35abac](https://github.com/mnahkies/openapi-code-generator/commit/e35abaca1e6ebaf1081a66cee8cc187ac73357e0))
* typescript-fetch mostly generating ([e798731](https://github.com/mnahkies/openapi-code-generator/commit/e7987318c59a4c136cad4833097b7912e993ccdf))
* **typescript-fetch:** omit optional query params ([#2](https://github.com/mnahkies/openapi-code-generator/issues/2)) ([fd10e9b](https://github.com/mnahkies/openapi-code-generator/commit/fd10e9b72a93e1e7e472de96f1cc9d340db63af4))
* use built-in / global fetch ([44eb83e](https://github.com/mnahkies/openapi-code-generator/commit/44eb83e6007ec379860048f7b45bb3d278fa8d69))
* use long form if ([f9b5af4](https://github.com/mnahkies/openapi-code-generator/commit/f9b5af4369867e70a00842b97c700c96333a4a34))
* use merge instead of intersection ([#28](https://github.com/mnahkies/openapi-code-generator/issues/28)) ([062455a](https://github.com/mnahkies/openapi-code-generator/commit/062455a50bbd6eb2b8cd1b902ec2c3565b7b0cba))
* use request body ([#32](https://github.com/mnahkies/openapi-code-generator/issues/32)) ([c0eba77](https://github.com/mnahkies/openapi-code-generator/commit/c0eba77fb9b30a7c32a6a1bfec9ed93a5ce7d739))


### Features

* add script consuming github fetch client ([#4](https://github.com/mnahkies/openapi-code-generator/issues/4)) ([a22d835](https://github.com/mnahkies/openapi-code-generator/commit/a22d8355152046e2a5a7ebda2f8c8460ee2f5612))
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
