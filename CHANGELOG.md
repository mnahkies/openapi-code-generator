# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.19.2](https://github.com/mnahkies/openapi-code-generator/compare/v0.19.1...v0.19.2) (2025-04-19)

### Bug Fixes

- dynamically require prettier ([#314](https://github.com/mnahkies/openapi-code-generator/issues/314)) ([4005711](https://github.com/mnahkies/openapi-code-generator/commit/4005711790d8d4f3c83296ed844dda17a188117a))

## [0.19.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.19.0...v0.19.1) (2025-04-18)

### Bug Fixes

- revert typespec ([#313](https://github.com/mnahkies/openapi-code-generator/issues/313)) ([b457c34](https://github.com/mnahkies/openapi-code-generator/commit/b457c34c1d2903c518416bdad24d6e25e830ad77))

# [0.19.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.18.0...v0.19.0) (2025-04-18)

### Bug Fixes

- joi array query params ([#309](https://github.com/mnahkies/openapi-code-generator/issues/309)) ([aba104e](https://github.com/mnahkies/openapi-code-generator/commit/aba104e484f463b180a9939d00ccddb55c1848aa))
- paths to openapi specifications ([#307](https://github.com/mnahkies/openapi-code-generator/issues/307)) ([0a0f623](https://github.com/mnahkies/openapi-code-generator/commit/0a0f62300179ce9f4096f1433742788ba27be8a5))
- typescript is a production dependency ([#299](https://github.com/mnahkies/openapi-code-generator/issues/299)) ([c7a0cbd](https://github.com/mnahkies/openapi-code-generator/commit/c7a0cbd4203df9692311dc76ad3394efba0a074c)), closes [/github.com/mnahkies/openapi-code-generator/blob/d0d73fa8feeaa1e8883f9825598fba022f9a77a1/packages/openapi-code-generator/src/core/loaders/tsconfig.loader.ts#L25](https://github.com//github.com/mnahkies/openapi-code-generator/blob/d0d73fa8feeaa1e8883f9825598fba022f9a77a1/packages/openapi-code-generator/src/core/loaders/tsconfig.loader.ts/issues/L25)

### Features

- add an interactive playground to the documentation site ([#216](https://github.com/mnahkies/openapi-code-generator/issues/216)) ([d0d73fa](https://github.com/mnahkies/openapi-code-generator/commit/d0d73fa8feeaa1e8883f9825598fba022f9a77a1))
- **docs:** upgrade to nextra 4 ([#301](https://github.com/mnahkies/openapi-code-generator/issues/301)) ([ccdef1e](https://github.com/mnahkies/openapi-code-generator/commit/ccdef1e8811bc0c634870e91a6fe05a9d23bc817))

# [0.18.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.17.0...v0.18.0) (2024-12-22)

### Bug Fixes

- **client-sdks:** handle 204 empty responses with runtime validation ([#288](https://github.com/mnahkies/openapi-code-generator/issues/288)) ([d3be20e](https://github.com/mnahkies/openapi-code-generator/commit/d3be20ed487c74e506caf8e8e89e5188e0e619d9)), closes [#285](https://github.com/mnahkies/openapi-code-generator/issues/285)
- intersected union schemas ([#283](https://github.com/mnahkies/openapi-code-generator/issues/283)) ([2a610c5](https://github.com/mnahkies/openapi-code-generator/commit/2a610c51cd32bafeab86af24519bf640a61c1572)), closes [#282](https://github.com/mnahkies/openapi-code-generator/issues/282)
- **typescript-fetch:** runtime validation works ([#287](https://github.com/mnahkies/openapi-code-generator/issues/287)) ([cead53a](https://github.com/mnahkies/openapi-code-generator/commit/cead53a25272764b012925115d247eb5cd619d49)), closes [#286](https://github.com/mnahkies/openapi-code-generator/issues/286)

- fix(joi)!: switch from @hapi/joi to joi (#284) ([6693e1d](https://github.com/mnahkies/openapi-code-generator/commit/6693e1de7b635bf99b3b41a1f41f66932697d416)), closes [#284](https://github.com/mnahkies/openapi-code-generator/issues/284)
- fix(typescript-axios)!: remove unused exports (#281) ([7b34fd4](https://github.com/mnahkies/openapi-code-generator/commit/7b34fd4bf337ae75aeb07ce5416805ea96fd6d99)), closes [#281](https://github.com/mnahkies/openapi-code-generator/issues/281)
- feat(typescript-fetch)!: simplify response types (#280) ([4340caf](https://github.com/mnahkies/openapi-code-generator/commit/4340caf009684a9034d1b90e4dc4753ab174e131)), closes [#280](https://github.com/mnahkies/openapi-code-generator/issues/280)

### BREAKING CHANGES

- `peerDependency` changed to `joi` for users of
  `--schema-builder joi`
- unused symbols `Res` and `StatusCode` dropped from `typescript-axios-runtime`
- `TypedFetchResponse` is removed, use `Res` directly if
  needed

# [0.17.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.16.0...v0.17.0) (2024-12-11)

### Bug Fixes

- support exactOptionalPropertyTypes on client SDKs ([#278](https://github.com/mnahkies/openapi-code-generator/issues/278)) ([5483b12](https://github.com/mnahkies/openapi-code-generator/commit/5483b12b65e977be13b5ce8728c94865c2d9e35d)), closes [#131](https://github.com/mnahkies/openapi-code-generator/issues/131)

- fix!: angular modules have unique export names (#270) ([2d4d43b](https://github.com/mnahkies/openapi-code-generator/commit/2d4d43b1c0a1a75946e5fbb3a3495d20d0386c16)), closes [#270](https://github.com/mnahkies/openapi-code-generator/issues/270)

### Features

- defaultHeaders is optional ([#274](https://github.com/mnahkies/openapi-code-generator/issues/274)) ([fc7cc62](https://github.com/mnahkies/openapi-code-generator/commit/fc7cc62cf26d84543606fb52b0a8edaa61655046))
- support http verb 'head' ([#271](https://github.com/mnahkies/openapi-code-generator/issues/271)) ([4841fed](https://github.com/mnahkies/openapi-code-generator/commit/4841fed79128da41c415da0496646d27abebbcee))
- support servers at path / operation level + variables ([#272](https://github.com/mnahkies/openapi-code-generator/issues/272)) ([969ca68](https://github.com/mnahkies/openapi-code-generator/commit/969ca68e9e069a80b42d6a050cfd7a8cdbbfeb91))

### BREAKING CHANGES

- angular service exports suffixed with `Service`

# [0.16.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.15.0...v0.16.0) (2024-11-02)

### Bug Fixes

- format/emit in parallel ([#265](https://github.com/mnahkies/openapi-code-generator/issues/265)) ([8f9c009](https://github.com/mnahkies/openapi-code-generator/commit/8f9c009daf0d861b3d42f1035ec7cc37053769d0))

- feat!: dynamic filename conventions / no spaces in filenames (#259) ([c6a72b5](https://github.com/mnahkies/openapi-code-generator/commit/c6a72b5ebc02ad2524fa14be49a6295b965a272b)), closes [#259](https://github.com/mnahkies/openapi-code-generator/issues/259)

### Features

- safer identifier transformation ([#260](https://github.com/mnahkies/openapi-code-generator/issues/260)) ([2bad95c](https://github.com/mnahkies/openapi-code-generator/commit/2bad95c63f57319a187996e88ba8be81e343e5a3))
- unique client export names ([#263](https://github.com/mnahkies/openapi-code-generator/issues/263)) ([205ee94](https://github.com/mnahkies/openapi-code-generator/commit/205ee94dc26fb8310ebfe91bb3c0eaa932ca0640)), closes [#259](https://github.com/mnahkies/openapi-code-generator/issues/259)

### BREAKING CHANGES

- emitted filenames may change if not already in
  `kebab-case` format. Use `--filename-convention` if an alternative
  convention such as `camel-case` is preferred.

# [0.15.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.14.0...v0.15.0) (2024-10-27)

### Bug Fixes

- **docs:** improve meta tags ([#255](https://github.com/mnahkies/openapi-code-generator/issues/255)) ([345b0d8](https://github.com/mnahkies/openapi-code-generator/commit/345b0d80954d85bc3b1e033dc6ee58cdb93e9ba4))
- validator uses new yaml sources ([a41dbd4](https://github.com/mnahkies/openapi-code-generator/commit/a41dbd493668c3455052ff86489fc9138da09ced))

### Features

- emit unique symbol names for Implementation / createRouter functions ([#258](https://github.com/mnahkies/openapi-code-generator/issues/258)) ([390bf7d](https://github.com/mnahkies/openapi-code-generator/commit/390bf7ddb7139f217590e6da4ee836cebca330bd)), closes [#111](https://github.com/mnahkies/openapi-code-generator/issues/111)
- support emitting abstract classes for implementation types ([#256](https://github.com/mnahkies/openapi-code-generator/issues/256)) ([d2b8276](https://github.com/mnahkies/openapi-code-generator/commit/d2b8276b57252fc6a1f5803f20773af696247b2d))

# [0.14.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.13.0...v0.14.0) (2024-10-12)

### Bug Fixes

- allow $ref to be used as a schema property ([#250](https://github.com/mnahkies/openapi-code-generator/issues/250)) ([9c09191](https://github.com/mnahkies/openapi-code-generator/commit/9c091911ec7128fbefef242c0e843788fab5b60f))
- **docs:** use absolute url for og:image ([#253](https://github.com/mnahkies/openapi-code-generator/issues/253)) ([d704219](https://github.com/mnahkies/openapi-code-generator/commit/d70421959b255a49fba840d98007c5a56ae7df5d))
- handle `type: "null"` in `anyOf` / `oneOf` / `allOf` ([#252](https://github.com/mnahkies/openapi-code-generator/issues/252)) ([9713c96](https://github.com/mnahkies/openapi-code-generator/commit/9713c96e5f31c5d23f5f77d3adf0ecd3c8f40a34))

### Features

- support loading relative remote uris ([#254](https://github.com/mnahkies/openapi-code-generator/issues/254)) ([4dc855c](https://github.com/mnahkies/openapi-code-generator/commit/4dc855cd222556272488ef543f195e06f8ba2957)), closes [#43](https://github.com/mnahkies/openapi-code-generator/issues/43)

# [0.13.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.12.1...v0.13.0) (2024-09-20)

- feat!: parse/validate request headers (#247) ([682d0c9](https://github.com/mnahkies/openapi-code-generator/commit/682d0c9f081400a0465ff8aa391c85a85e3e8462)), closes [#247](https://github.com/mnahkies/openapi-code-generator/issues/247)

### Features

- include urls from servers array in basePath type ([#246](https://github.com/mnahkies/openapi-code-generator/issues/246)) ([212c434](https://github.com/mnahkies/openapi-code-generator/commit/212c434da73f95645499889cafa11e7bc19675ac))
- suppport default values ([#241](https://github.com/mnahkies/openapi-code-generator/issues/241)) ([6127cc8](https://github.com/mnahkies/openapi-code-generator/commit/6127cc8a06c818454e8aaca4f3a3fac03c5518a2))

### BREAKING CHANGES

- requests receiving incorrect request header parameters
  will now fail with a validation error

## [0.12.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.12.0...v0.12.1) (2024-08-17)

### Bug Fixes

- allow number array query param ([#236](https://github.com/mnahkies/openapi-code-generator/issues/236)) ([3ace597](https://github.com/mnahkies/openapi-code-generator/commit/3ace597489bde7103bc8b3fbae6f11238c5c3fdf)), closes [#235](https://github.com/mnahkies/openapi-code-generator/issues/235)
- **fetch/axios:** correctly merge headers from opts ([#231](https://github.com/mnahkies/openapi-code-generator/issues/231)) ([5efc36e](https://github.com/mnahkies/openapi-code-generator/commit/5efc36e5c15d3995c46486677ccce680a5c95602))

### Features

- add e2e test suite ([#235](https://github.com/mnahkies/openapi-code-generator/issues/235)) ([9209a3f](https://github.com/mnahkies/openapi-code-generator/commit/9209a3faf57e857b415e68a1ecaa864946fa3e40))

# [0.12.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.11.2...v0.12.0) (2024-08-05)

### Features

- support remote specs with authentication ([#230](https://github.com/mnahkies/openapi-code-generator/issues/230)) ([5beee35](https://github.com/mnahkies/openapi-code-generator/commit/5beee35b44b8351410cd98eff5409d076f87157a)), closes [#229](https://github.com/mnahkies/openapi-code-generator/issues/229)

## [0.11.2](https://github.com/mnahkies/openapi-code-generator/compare/v0.11.1...v0.11.2) (2024-07-29)

### Bug Fixes

- improve seo, use plausible ([#226](https://github.com/mnahkies/openapi-code-generator/issues/226)) ([e32afd5](https://github.com/mnahkies/openapi-code-generator/commit/e32afd5b486b4547029121031782b6585fd93321))
- include schemas from all documents in dependency graph ([#227](https://github.com/mnahkies/openapi-code-generator/issues/227)) ([5fa614d](https://github.com/mnahkies/openapi-code-generator/commit/5fa614dd5365af675dab2856a4d17adcad018253))

## [0.11.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.11.0...v0.11.1) (2024-07-27)

### Bug Fixes

- peer dependency ([#224](https://github.com/mnahkies/openapi-code-generator/issues/224)) ([ea0d044](https://github.com/mnahkies/openapi-code-generator/commit/ea0d0442ce75a4a2ba281dae4731614b258cb7f0)), closes [#223](https://github.com/mnahkies/openapi-code-generator/issues/223)

# [0.11.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.10.0...v0.11.0) (2024-06-08)

### Bug Fixes

- **axios:** always apply default headers ([#218](https://github.com/mnahkies/openapi-code-generator/issues/218)) ([9177ae0](https://github.com/mnahkies/openapi-code-generator/commit/9177ae03e3b9285f6a684f452f4610698a696ad6))
- decouple typespec loader from readline ([#215](https://github.com/mnahkies/openapi-code-generator/issues/215)) ([6678381](https://github.com/mnahkies/openapi-code-generator/commit/66783819e2216ecf814a77807233482bada2cf4a)), closes [#212](https://github.com/mnahkies/openapi-code-generator/issues/212)
- decouple validator from readline ([#212](https://github.com/mnahkies/openapi-code-generator/issues/212)) ([8d37c0b](https://github.com/mnahkies/openapi-code-generator/commit/8d37c0b953305b73057ecc1e937788d0507cb4fe))
- make logger compatible with web ([#211](https://github.com/mnahkies/openapi-code-generator/issues/211)) ([204b6a8](https://github.com/mnahkies/openapi-code-generator/commit/204b6a813fe75272bdae0dfa192132974e596206))
- move tsconfig loading ([#214](https://github.com/mnahkies/openapi-code-generator/issues/214)) ([48526f3](https://github.com/mnahkies/openapi-code-generator/commit/48526f3f306f1552b8ab4268b31aef6fdf48b318))

### Features

- add a prettier based formatter ([#213](https://github.com/mnahkies/openapi-code-generator/issues/213)) ([8b0c015](https://github.com/mnahkies/openapi-code-generator/commit/8b0c015e86ff1eb6310257dd322cfe3944926926))

# [0.10.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.9.0...v0.10.0) (2024-05-25)

### Bug Fixes

- an {} schema should be an unknown/any type ([#204](https://github.com/mnahkies/openapi-code-generator/issues/204)) ([b56ac4f](https://github.com/mnahkies/openapi-code-generator/commit/b56ac4f18ddd1ee95cc8e98065cd6c9b360de18b)), closes [#200](https://github.com/mnahkies/openapi-code-generator/issues/200)
- **deps:** update angular monorepo ([#175](https://github.com/mnahkies/openapi-code-generator/issues/175)) ([245f62a](https://github.com/mnahkies/openapi-code-generator/commit/245f62a9901e86dc1fced053259d171dfa03a0c4))
- **deps:** update dependency @biomejs/biome to v1.7.2 ([#176](https://github.com/mnahkies/openapi-code-generator/issues/176)) ([f754a4a](https://github.com/mnahkies/openapi-code-generator/commit/f754a4afd7f4b5a12e1f1f6d03d38098ceda796e))
- **deps:** update dependency ajv to v8.13.0 ([#183](https://github.com/mnahkies/openapi-code-generator/issues/183)) ([a215cd1](https://github.com/mnahkies/openapi-code-generator/commit/a215cd1821ae9193284ead114d566e01e2b1587d))
- **docs:** correct header level ([#209](https://github.com/mnahkies/openapi-code-generator/issues/209)) ([e22bc24](https://github.com/mnahkies/openapi-code-generator/commit/e22bc24293842df429ff18e4b77e7504e1c27ec8))
- improve handling of cli boolean params ([#205](https://github.com/mnahkies/openapi-code-generator/issues/205)) ([24cd899](https://github.com/mnahkies/openapi-code-generator/commit/24cd899cf3d523d2e4b1daf59311cb8c2bfb3e45))
- joi supports email / date-time string formats ([#206](https://github.com/mnahkies/openapi-code-generator/issues/206)) ([1981108](https://github.com/mnahkies/openapi-code-generator/commit/1981108114e7956ce0c3e5b5d67cb0b412a61fc4))
- make renovate less noisy ([#197](https://github.com/mnahkies/openapi-code-generator/issues/197)) ([88d0a57](https://github.com/mnahkies/openapi-code-generator/commit/88d0a572649466296498764f079b44e9ed32ffc8))
- move script to \_app ([#167](https://github.com/mnahkies/openapi-code-generator/issues/167)) ([04bf9bb](https://github.com/mnahkies/openapi-code-generator/commit/04bf9bb66cfd62178e90c27674a588325b12c662))
- only allow publish of releases from latest main ([#161](https://github.com/mnahkies/openapi-code-generator/issues/161)) ([8f2d698](https://github.com/mnahkies/openapi-code-generator/commit/8f2d69825d43eba9653c7c0acb2ea1b864b610df))
- provide a user ([#164](https://github.com/mnahkies/openapi-code-generator/issues/164)) ([a935611](https://github.com/mnahkies/openapi-code-generator/commit/a93561138ef7dc37ec0ce9d626b5894fc341016f))
- replace default nextra meta descriptions ([#168](https://github.com/mnahkies/openapi-code-generator/issues/168)) ([4c8bf6c](https://github.com/mnahkies/openapi-code-generator/commit/4c8bf6c60f66f86101d81ea7c67d5caa6b40e017))
- set url ([#166](https://github.com/mnahkies/openapi-code-generator/issues/166)) ([6c62f65](https://github.com/mnahkies/openapi-code-generator/commit/6c62f652fdb51b53914e129e60b37cdefe548adf)), closes [/github.com/tschaub/gh-pages/issues/384#issuecomment-1236047843](https://github.com//github.com/tschaub/gh-pages/issues/384/issues/issuecomment-1236047843)
- try git config ([#165](https://github.com/mnahkies/openapi-code-generator/issues/165)) ([b6a6715](https://github.com/mnahkies/openapi-code-generator/commit/b6a67158029d4b1cd3388ae0564fb88695781f11))

### Features

- new documentation website ([#162](https://github.com/mnahkies/openapi-code-generator/issues/162)) ([ba002cf](https://github.com/mnahkies/openapi-code-generator/commit/ba002cf208f2bb6b51299c6655f0b1bec22e2d93))
- publish docs from ci, add ga to docs ([#163](https://github.com/mnahkies/openapi-code-generator/issues/163)) ([f935bb5](https://github.com/mnahkies/openapi-code-generator/commit/f935bb5a1e07c52dc1fee81ca5f53cace9f94362))

# [0.9.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.8.0...v0.9.0) (2024-04-27)

### Bug Fixes

- allow options ([#151](https://github.com/mnahkies/openapi-code-generator/issues/151)) ([5d45385](https://github.com/mnahkies/openapi-code-generator/commit/5d45385642bfbc6da6902af9c05435596441e368))

### Features

- support loading input from uri ([#150](https://github.com/mnahkies/openapi-code-generator/issues/150)) ([cce87ba](https://github.com/mnahkies/openapi-code-generator/commit/cce87ba7137c3e0c833014ffa5c4f5d2a32f317d)), closes [#43](https://github.com/mnahkies/openapi-code-generator/issues/43)
- support typespec as an input format ([#158](https://github.com/mnahkies/openapi-code-generator/issues/158)) ([b1cdbf4](https://github.com/mnahkies/openapi-code-generator/commit/b1cdbf4d2675312a19478a1770fcd528a5eb2f18)), closes [#148](https://github.com/mnahkies/openapi-code-generator/issues/148)

# [0.8.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.7.0...v0.8.0) (2024-04-07)

### Features

- joi number min/max validation ([#143](https://github.com/mnahkies/openapi-code-generator/issues/143)) ([179ea58](https://github.com/mnahkies/openapi-code-generator/commit/179ea5853d170b717c09d75ffdc3bbb0e738e577)), closes [#140](https://github.com/mnahkies/openapi-code-generator/issues/140)
- support basic array validation ([#147](https://github.com/mnahkies/openapi-code-generator/issues/147)) ([1dcb0a8](https://github.com/mnahkies/openapi-code-generator/commit/1dcb0a815b02e89a024aae44f299fa96e65036e8)), closes [/datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-6](https://github.com//datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00/issues/section-6)
- support exclusive min/max and multipleOf ([#144](https://github.com/mnahkies/openapi-code-generator/issues/144)) ([0f473bd](https://github.com/mnahkies/openapi-code-generator/commit/0f473bd4dd68653184601be6b00a2d22324bc466)), closes [#140](https://github.com/mnahkies/openapi-code-generator/issues/140) [#143](https://github.com/mnahkies/openapi-code-generator/issues/143) [#51](https://github.com/mnahkies/openapi-code-generator/issues/51) [/datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-6](https://github.com//datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00/issues/section-6)
- support minimum / maximum for numbers ([#140](https://github.com/mnahkies/openapi-code-generator/issues/140)) ([21f2a76](https://github.com/mnahkies/openapi-code-generator/commit/21f2a7619d53d100cb7d95004bc0306329e689f2)), closes [#51](https://github.com/mnahkies/openapi-code-generator/issues/51)
- support string validation ([#145](https://github.com/mnahkies/openapi-code-generator/issues/145)) ([1602764](https://github.com/mnahkies/openapi-code-generator/commit/1602764e4b1e8cdb385ab284534ff6ba330189a9)), closes [/datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-6](https://github.com//datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00/issues/section-6) [/github.com/nodejs/node/issues/2503#issuecomment-133842814](https://github.com//github.com/nodejs/node/issues/2503/issues/issuecomment-133842814)
- use pre-compiled ajv validators at runtime ([#141](https://github.com/mnahkies/openapi-code-generator/issues/141)) ([5439e9d](https://github.com/mnahkies/openapi-code-generator/commit/5439e9d1856955d8e42e11e3335ce55eb45ba500))

# [0.7.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.6.0...v0.7.0) (2024-03-03)

### Features

- adopt biome for code formatting ([#129](https://github.com/mnahkies/openapi-code-generator/issues/129)) ([b75bc65](https://github.com/mnahkies/openapi-code-generator/commit/b75bc650287bfa8801d634dece70c4eed3fb91d5))
- eliminate unused imports ([#132](https://github.com/mnahkies/openapi-code-generator/issues/132)) ([c3d87ce](https://github.com/mnahkies/openapi-code-generator/commit/c3d87ce2b533a327a6eb68834b3906c72968aee6))
- experimental support for splitting code by tags / route segments ([#134](https://github.com/mnahkies/openapi-code-generator/issues/134)) ([9a23e4f](https://github.com/mnahkies/openapi-code-generator/commit/9a23e4f2ff9e9d7ed0971c7c487a9923ab062abe))
- use strict typescript settings ([#131](https://github.com/mnahkies/openapi-code-generator/issues/131)) ([39758e2](https://github.com/mnahkies/openapi-code-generator/commit/39758e2f23d24adde3218e6ce32863e0fd587f7d)), closes [#129](https://github.com/mnahkies/openapi-code-generator/issues/129)

# [0.6.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.5.0...v0.6.0) (2024-02-19)

### Features

- improve additional properties support ([#126](https://github.com/mnahkies/openapi-code-generator/issues/126)) ([7a8c289](https://github.com/mnahkies/openapi-code-generator/commit/7a8c289e7aa242ee700553f23244be3676579ebc)), closes [#125](https://github.com/mnahkies/openapi-code-generator/issues/125) [#44](https://github.com/mnahkies/openapi-code-generator/issues/44)
- support response validation for joi ([#127](https://github.com/mnahkies/openapi-code-generator/issues/127)) ([30f22a8](https://github.com/mnahkies/openapi-code-generator/commit/30f22a87b6465d251e1154216f708ea4fb9d5dc3)), closes [#112](https://github.com/mnahkies/openapi-code-generator/issues/112)

# [0.5.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.4.0...v0.5.0) (2024-02-10)

### Bug Fixes

- use RouterContext rather than plain Context ([a13c1b7](https://github.com/mnahkies/openapi-code-generator/commit/a13c1b76522c5bdf172229e88b02be1390286fd0))

### Features

- client generators support experimental runtime response validation ([#112](https://github.com/mnahkies/openapi-code-generator/issues/112)) ([f3c3610](https://github.com/mnahkies/openapi-code-generator/commit/f3c361074db22d3de0db044d34cffd2e36772429)), closes [#82](https://github.com/mnahkies/openapi-code-generator/issues/82)
- experimental support for extracting inline schemas ([#123](https://github.com/mnahkies/openapi-code-generator/issues/123)) ([1c11d77](https://github.com/mnahkies/openapi-code-generator/commit/1c11d778f4aa19451e5d8c3271d45a8dc9d12070))

# [0.4.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.3.0...v0.4.0) (2024-01-05)

### Bug Fixes

- incorrect .d.ts path for zod ([#119](https://github.com/mnahkies/openapi-code-generator/issues/119)) ([f0d737d](https://github.com/mnahkies/openapi-code-generator/commit/f0d737dbafff29f5e5ab573bb68ed7ac03eef5ef)), closes [#117](https://github.com/mnahkies/openapi-code-generator/issues/117)
- **koa:** don't camel-case route placeholders ([#120](https://github.com/mnahkies/openapi-code-generator/issues/120)) ([59e1438](https://github.com/mnahkies/openapi-code-generator/commit/59e1438d1f01cd505cb5f93de6cb4937a5133e20)), closes [#118](https://github.com/mnahkies/openapi-code-generator/issues/118) [#118](https://github.com/mnahkies/openapi-code-generator/issues/118)

### Features

- **typescript-koa:** introduce optional "respond" pattern ([c6595a1](https://github.com/mnahkies/openapi-code-generator/commit/c6595a118dcd37bf81b3c22a7f3ddc760a5cf113))

# [0.3.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.2.0...v0.3.0) (2023-12-02)

### Bug Fixes

- decouple schema builders from typescript-koa ([#113](https://github.com/mnahkies/openapi-code-generator/issues/113)) ([f75a80c](https://github.com/mnahkies/openapi-code-generator/commit/f75a80c9cad7cd1b11a282f542fd05b0fb2d2c86)), closes [#112](https://github.com/mnahkies/openapi-code-generator/issues/112)

- feat!: throw discriminable errors indicating point of failure (#95) ([4badd41](https://github.com/mnahkies/openapi-code-generator/commit/4badd4114b1c19e73631b48610751f9229f436c8)), closes [#95](https://github.com/mnahkies/openapi-code-generator/issues/95) [/github.com/mnahkies/openapi-code-generator/pull/95/files#diff-b82e27c39ae18163c6d5547d0bf1c5dd9a92302ae047f160a76ea0c7af5ad7b0](https://github.com//github.com/mnahkies/openapi-code-generator/pull/95/files/issues/diff-b82e27c39ae18163c6d5547d0bf1c5dd9a92302ae047f160a76ea0c7af5ad7b0)

### Features

- add typescript-axios template ([#83](https://github.com/mnahkies/openapi-code-generator/issues/83)) ([c3e045d](https://github.com/mnahkies/openapi-code-generator/commit/c3e045d446e2af9f75f5724a19b58c212376751f))
- include schema builder in client generators ([#114](https://github.com/mnahkies/openapi-code-generator/issues/114)) ([9beb268](https://github.com/mnahkies/openapi-code-generator/commit/9beb2682fdc724871206d18a2c678e56d7c6238b)), closes [#112](https://github.com/mnahkies/openapi-code-generator/issues/112)

### BREAKING CHANGES

- \*\* errors thrown are now wrapped in `KoaRuntimeError`
  objects.

# [0.2.0](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.1...v0.2.0) (2023-11-12)

### Bug Fixes

- allow numeric header values ([#105](https://github.com/mnahkies/openapi-code-generator/issues/105)) ([7feab98](https://github.com/mnahkies/openapi-code-generator/commit/7feab98733584221c28dd1f9b8e1f3097d58e28f))
- handle `"` in string enum values ([#107](https://github.com/mnahkies/openapi-code-generator/issues/107)) ([5b2c341](https://github.com/mnahkies/openapi-code-generator/commit/5b2c341a9a240a62e66c3eda49e80fd36b7c50a1)), closes [/github.com/APIs-guru/openapi-directory/blob/dec74da7a6785d5d5b83bc6a4cebc07336d67ec9/APIs/vercel.com/0.0.1/openapi.yaml#L4810](https://github.com//github.com/APIs-guru/openapi-directory/blob/dec74da7a6785d5d5b83bc6a4cebc07336d67ec9/APIs/vercel.com/0.0.1/openapi.yaml/issues/L4810)
- handle null in enums ([#106](https://github.com/mnahkies/openapi-code-generator/issues/106)) ([b235a7e](https://github.com/mnahkies/openapi-code-generator/commit/b235a7ead75a7655073e67b30a94c980eb9c81ef)), closes [/github.com/APIs-guru/openapi-directory/blob/dec74da7a6785d5d5b83bc6a4cebc07336d67ec9/APIs/vercel.com/0.0.1/openapi.yaml#L4648-L4655](https://github.com//github.com/APIs-guru/openapi-directory/blob/dec74da7a6785d5d5b83bc6a4cebc07336d67ec9/APIs/vercel.com/0.0.1/openapi.yaml/issues/L4648-L4655)
- optional oneOf / allOf / anyOf / $ref's ([#110](https://github.com/mnahkies/openapi-code-generator/issues/110)) ([2ff114a](https://github.com/mnahkies/openapi-code-generator/commit/2ff114ad60df1ab24085d4d6f9ab23e11c2fdd0c))
- skip broken openapi 3.1 validation for now ([#104](https://github.com/mnahkies/openapi-code-generator/issues/104)) ([f6e7956](https://github.com/mnahkies/openapi-code-generator/commit/f6e795629caa2adf9b00d53b2a771134135afdc8)), closes [#103](https://github.com/mnahkies/openapi-code-generator/issues/103)
- use numerical enums when creating zod schema ([#108](https://github.com/mnahkies/openapi-code-generator/issues/108)) ([7564c10](https://github.com/mnahkies/openapi-code-generator/commit/7564c10c730d008629a45f46d1cc074ba225e429)), closes [/github.com/colinhacks/zod/issues/2686#issuecomment-1807096385](https://github.com//github.com/colinhacks/zod/issues/2686/issues/issuecomment-1807096385)

### Features

- basic support for openapi 3.1 ([#109](https://github.com/mnahkies/openapi-code-generator/issues/109)) ([60838d9](https://github.com/mnahkies/openapi-code-generator/commit/60838d93ac8e672f2227d399b3926da17073385e))

## [0.1.1](https://github.com/mnahkies/openapi-code-generator/compare/v0.1.0...v0.1.1) (2023-11-11)

### Bug Fixes

- avoid warning for non-nullable paths ([#90](https://github.com/mnahkies/openapi-code-generator/issues/90)) ([b857182](https://github.com/mnahkies/openapi-code-generator/commit/b8571820109ca31e836b7141f5aac5a88919096b))
- delete files missed in [#92](https://github.com/mnahkies/openapi-code-generator/issues/92) ([#93](https://github.com/mnahkies/openapi-code-generator/issues/93)) ([9ccdd50](https://github.com/mnahkies/openapi-code-generator/commit/9ccdd50a30e6b726ea59c46396929fd0220a3aa6))
- don't coerce strings ([e579295](https://github.com/mnahkies/openapi-code-generator/commit/e57929559a351f3c48590e19c4be8b115ba6de8d))
- unused imports ([#97](https://github.com/mnahkies/openapi-code-generator/issues/97)) ([c2a0ae5](https://github.com/mnahkies/openapi-code-generator/commit/c2a0ae50e2ff9e81181f032ca514a1e974f08321))

# 0.1.0 (2023-10-01)

### Bug Fixes

- avoid type conflict between jasmine and mocha ([bc471ca](https://github.com/mnahkies/openapi-code-generator/commit/bc471caed434717adb53c13379f6e3f9891e1d29))
- dependency graph handles oneOf allOf nesting ([#73](https://github.com/mnahkies/openapi-code-generator/issues/73)) ([52ca608](https://github.com/mnahkies/openapi-code-generator/commit/52ca608368c0af31573b707a2621647859823d7e))
- eslint disable in generated files ([#30](https://github.com/mnahkies/openapi-code-generator/issues/30)) ([1ee33c4](https://github.com/mnahkies/openapi-code-generator/commit/1ee33c4d181a16d43e3a7d81f75db2ea6662e963)), closes [/eslint.org/docs/latest/use/configure/rules#using-configuration-comments-1](https://github.com//eslint.org/docs/latest/use/configure/rules/issues/using-configuration-comments-1)
- implicit any ([74952a7](https://github.com/mnahkies/openapi-code-generator/commit/74952a744b5ed9eba05ffd9a46bdc7ea75cd7683))
- improve null support ([#40](https://github.com/mnahkies/openapi-code-generator/issues/40)) ([c2c3c1f](https://github.com/mnahkies/openapi-code-generator/commit/c2c3c1f4c23e65e71d624e59186a4fb07072f315))
- improve support for nullable types ([#33](https://github.com/mnahkies/openapi-code-generator/issues/33)) ([bedfee0](https://github.com/mnahkies/openapi-code-generator/commit/bedfee015f2af2a638c0afe2fcca00523f670060))
- improve validation to switch between 3.1.0 / 3.0.0 ([#34](https://github.com/mnahkies/openapi-code-generator/issues/34)) ([915456f](https://github.com/mnahkies/openapi-code-generator/commit/915456fa281181652b831d036c65a0387c6cf58b))
- lint ([fe704fa](https://github.com/mnahkies/openapi-code-generator/commit/fe704fa3bd5ef093f244b2d8de05e20e92749c43))
- lint errors ([92a69a8](https://github.com/mnahkies/openapi-code-generator/commit/92a69a88e35f7a79804a9444cfc1e195b08e4c0c))
- logger goes straight to stdout/stderr ([0c39a04](https://github.com/mnahkies/openapi-code-generator/commit/0c39a04ad26fe5b7a62f8b8e8188d4a6ad233cf3))
- master -> main ([#77](https://github.com/mnahkies/openapi-code-generator/issues/77)) ([dade840](https://github.com/mnahkies/openapi-code-generator/commit/dade840c94c0e5e1f47c02440f6e9fb776cceea7))
- plumb through middleware ([#80](https://github.com/mnahkies/openapi-code-generator/issues/80)) ([d02813e](https://github.com/mnahkies/openapi-code-generator/commit/d02813efa3480a0cd827bfd1a7fa191450307374))
- remove broken functionality ([#78](https://github.com/mnahkies/openapi-code-generator/issues/78)) ([3e5dad1](https://github.com/mnahkies/openapi-code-generator/commit/3e5dad197d893eef847686d6ccfa19f046d7308e))
- remove unused, tidy ups ([0be1033](https://github.com/mnahkies/openapi-code-generator/commit/0be1033c48302f5c0d3ae7cdfe9447e635f11cd6))
- replace . in identifiers ([#50](https://github.com/mnahkies/openapi-code-generator/issues/50)) ([ac4ce9b](https://github.com/mnahkies/openapi-code-generator/commit/ac4ce9b5a0ca9d0873f3c02aecaa96c4edbeed81))
- request bodies can be optional ([#24](https://github.com/mnahkies/openapi-code-generator/issues/24)) ([810619c](https://github.com/mnahkies/openapi-code-generator/commit/810619c0063606ddfc295ba2e9d2bf0a80938bb7))
- respect optional $ref properties ([#22](https://github.com/mnahkies/openapi-code-generator/issues/22)) ([32e80d8](https://github.com/mnahkies/openapi-code-generator/commit/32e80d8f11e1d60cd3dddbfd9805209c6acf654e))
- share requestBodyAsParameter implementation ([2f7477b](https://github.com/mnahkies/openapi-code-generator/commit/2f7477b0595d8ab3389a5910cd639b1cc4feefa6))
- stop angular integration tests building with packages ([feb776d](https://github.com/mnahkies/openapi-code-generator/commit/feb776db56e4900514cf8ccee33aa47176bef093))
- surface status code -> body relationship in angular template ([#63](https://github.com/mnahkies/openapi-code-generator/issues/63)) ([7b1ffe9](https://github.com/mnahkies/openapi-code-generator/commit/7b1ffe916742ac2a8ebf90c769df20b24f4f3769))
- switch to qs and add tests for query string ([#56](https://github.com/mnahkies/openapi-code-generator/issues/56)) ([dbcec86](https://github.com/mnahkies/openapi-code-generator/commit/dbcec86d19932a1ed3180934bebea811c240aff7))
- try using wildcard version to work around lerna publish bug ([#84](https://github.com/mnahkies/openapi-code-generator/issues/84)) ([e35abac](https://github.com/mnahkies/openapi-code-generator/commit/e35abaca1e6ebaf1081a66cee8cc187ac73357e0))
- typescript-fetch mostly generating ([e798731](https://github.com/mnahkies/openapi-code-generator/commit/e7987318c59a4c136cad4833097b7912e993ccdf))
- **typescript-fetch:** omit optional query params ([#2](https://github.com/mnahkies/openapi-code-generator/issues/2)) ([fd10e9b](https://github.com/mnahkies/openapi-code-generator/commit/fd10e9b72a93e1e7e472de96f1cc9d340db63af4))
- use built-in / global fetch ([44eb83e](https://github.com/mnahkies/openapi-code-generator/commit/44eb83e6007ec379860048f7b45bb3d278fa8d69))
- use long form if ([f9b5af4](https://github.com/mnahkies/openapi-code-generator/commit/f9b5af4369867e70a00842b97c700c96333a4a34))
- use merge instead of intersection ([#28](https://github.com/mnahkies/openapi-code-generator/issues/28)) ([062455a](https://github.com/mnahkies/openapi-code-generator/commit/062455a50bbd6eb2b8cd1b902ec2c3565b7b0cba))
- use request body ([#32](https://github.com/mnahkies/openapi-code-generator/issues/32)) ([c0eba77](https://github.com/mnahkies/openapi-code-generator/commit/c0eba77fb9b30a7c32a6a1bfec9ed93a5ce7d739))

### Features

- add script consuming github fetch client ([#4](https://github.com/mnahkies/openapi-code-generator/issues/4)) ([a22d835](https://github.com/mnahkies/openapi-code-generator/commit/a22d8355152046e2a5a7ebda2f8c8460ee2f5612))
- better support for additional properties ([#57](https://github.com/mnahkies/openapi-code-generator/issues/57)) ([e69881b](https://github.com/mnahkies/openapi-code-generator/commit/e69881b5e682d6799528a0b0b49dbb3b669dc7d1))
- clients default params to {} when none are required ([#36](https://github.com/mnahkies/openapi-code-generator/issues/36)) ([1ffdc52](https://github.com/mnahkies/openapi-code-generator/commit/1ffdc52f8c2b5358d59346c0eb54032a0708b4b5))
- config flag to switch schema parser ([#39](https://github.com/mnahkies/openapi-code-generator/issues/39)) ([336e923](https://github.com/mnahkies/openapi-code-generator/commit/336e923b3e25aeb63307c70d430e0fd68f553e67)), closes [#13](https://github.com/mnahkies/openapi-code-generator/issues/13)
- fetch client supports abort signals ([#65](https://github.com/mnahkies/openapi-code-generator/issues/65)) ([e646771](https://github.com/mnahkies/openapi-code-generator/commit/e646771a75643e8b53525ef9693c082ab372c22d))
- improve client generation ([#35](https://github.com/mnahkies/openapi-code-generator/issues/35)) ([48a806a](https://github.com/mnahkies/openapi-code-generator/commit/48a806a18480565e4299f2b37555bf630f864258))
- initial support for anyOf ([#55](https://github.com/mnahkies/openapi-code-generator/issues/55)) ([a61cbb9](https://github.com/mnahkies/openapi-code-generator/commit/a61cbb92a6a656a81b6c52b65ebd51c473f2c48a)), closes [#46](https://github.com/mnahkies/openapi-code-generator/issues/46)
- initial support for oneOf ([#23](https://github.com/mnahkies/openapi-code-generator/issues/23)) ([1619bf7](https://github.com/mnahkies/openapi-code-generator/commit/1619bf781b6b1f623a37ec2a7cde2ed2990bec06))
- move more static code into koa runtime ([#21](https://github.com/mnahkies/openapi-code-generator/issues/21)) ([0b175af](https://github.com/mnahkies/openapi-code-generator/commit/0b175afebcb394a381326b38827308578e4f907c))
- move static code to normal files ([#20](https://github.com/mnahkies/openapi-code-generator/issues/20)) ([2897680](https://github.com/mnahkies/openapi-code-generator/commit/2897680d8429466984724a2980f1b250fde851e7))
- new approach to server stubs ([#9](https://github.com/mnahkies/openapi-code-generator/issues/9)) ([aff4835](https://github.com/mnahkies/openapi-code-generator/commit/aff48352dc7244175bc9abaacc6412f3c288e895))
- order schemas correctly ([#37](https://github.com/mnahkies/openapi-code-generator/issues/37)) ([9f899dd](https://github.com/mnahkies/openapi-code-generator/commit/9f899dd641f7ff20a21556a1851802129866b412))
- overhaul docs / publish to npm ([#75](https://github.com/mnahkies/openapi-code-generator/issues/75)) ([f9386ab](https://github.com/mnahkies/openapi-code-generator/commit/f9386ab74ef3e7c6eff7040bd86d4efeccdfd868))
- response body validation and types ([#29](https://github.com/mnahkies/openapi-code-generator/issues/29)) ([ffc8f20](https://github.com/mnahkies/openapi-code-generator/commit/ffc8f20487c11f339d08c2493ba68b23fea041f9)), closes [#11](https://github.com/mnahkies/openapi-code-generator/issues/11)
- rework input schema parsing ([#25](https://github.com/mnahkies/openapi-code-generator/issues/25)) ([7bae0ad](https://github.com/mnahkies/openapi-code-generator/commit/7bae0ad0c5c3d49ab172df44f5ae1b4332aaa8be))
- support circular references ([#58](https://github.com/mnahkies/openapi-code-generator/issues/58)) ([48f8d89](https://github.com/mnahkies/openapi-code-generator/commit/48f8d89f668edcd98d37146ac8763fbc71953049)), closes [#49](https://github.com/mnahkies/openapi-code-generator/issues/49)
- support loading from literal ([5e47ed0](https://github.com/mnahkies/openapi-code-generator/commit/5e47ed0b10efc24c267112cafe77a120388d58b4))
- support string enums in zod parsing ([efe2e2e](https://github.com/mnahkies/openapi-code-generator/commit/efe2e2e116dbd87198d647e8dfaddade311320b8))
- support zod for parsing inputs ([e0c1b88](https://github.com/mnahkies/openapi-code-generator/commit/e0c1b88b9dec1946566696ea367933cb48ba9d2b))
- use commander for cli args for better ux ([#76](https://github.com/mnahkies/openapi-code-generator/issues/76)) ([26d7401](https://github.com/mnahkies/openapi-code-generator/commit/26d7401cb635bdf7b3f0b649adc7f792a5710ad6))
- zod schema builder supports allOf ([#27](https://github.com/mnahkies/openapi-code-generator/issues/27)) ([b09fcc9](https://github.com/mnahkies/openapi-code-generator/commit/b09fcc957116555953c96723db3aafdff094b92e))
