import {defaultSyntheticNameGenerator} from "./core/synthetic-name-generator.ts"
import type {OpenapiGenerator} from "./templates.types.ts"
import {generateTypescriptAngular} from "./typescript/client/typescript-angular/typescript-angular.generator.ts"
import {generateTypescriptAxios} from "./typescript/client/typescript-axios/typescript-axios.generator.ts"
import {generateTypescriptFetch} from "./typescript/client/typescript-fetch/typescript-fetch.generator.ts"
import {generateTypescriptExpress} from "./typescript/server/typescript-express/typescript-express.generator.ts"
import {generateTypescriptKoa} from "./typescript/server/typescript-koa/typescript-koa.generator.ts"

export const templates = {
  "typescript-fetch": {
    language: "typescript",
    type: "client",
    run: generateTypescriptFetch,
    syntheticNameGenerator: defaultSyntheticNameGenerator,
  },
  "typescript-axios": {
    language: "typescript",
    type: "client",
    run: generateTypescriptAxios,
    syntheticNameGenerator: defaultSyntheticNameGenerator,
  },
  "typescript-angular": {
    language: "typescript",
    type: "client",
    run: generateTypescriptAngular,
    syntheticNameGenerator: defaultSyntheticNameGenerator,
  },
  "typescript-koa": {
    language: "typescript",
    type: "server",
    run: generateTypescriptKoa,
    syntheticNameGenerator: defaultSyntheticNameGenerator,
  },
  "typescript-express": {
    language: "typescript",
    type: "server",
    run: generateTypescriptExpress,
    syntheticNameGenerator: defaultSyntheticNameGenerator,
  },
} satisfies {[key: string]: OpenapiGenerator}

export const templateNames = [
  "typescript-fetch",
  "typescript-axios",
  "typescript-angular",
  "typescript-koa",
  "typescript-express",
] as const satisfies Array<keyof typeof templates>
