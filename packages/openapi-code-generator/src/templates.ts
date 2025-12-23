import {defaultSyntheticNameGenerator} from "./core/synthetic-name-generator"
import type {OpenapiGenerator} from "./templates.types"
import {generateTypescriptAngular} from "./typescript/client/typescript-angular/typescript-angular.generator"
import {generateTypescriptAxios} from "./typescript/client/typescript-axios/typescript-axios.generator"
import {generateTypescriptFetch} from "./typescript/client/typescript-fetch/typescript-fetch.generator"
import {generateTypescriptExpress} from "./typescript/server/typescript-express/typescript-express.generator"
import {generateTypescriptKoa} from "./typescript/server/typescript-koa/typescript-koa.generator"
import {generateTypescriptNextJS} from "./typescript/server/typescript-nextjs/typescript-nextjs.generator"

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
  "typescript-nextjs": {
    language: "typescript",
    type: "server",
    run: generateTypescriptNextJS,
    syntheticNameGenerator: defaultSyntheticNameGenerator,
  },
} satisfies {[key: string]: OpenapiGenerator}

export const templateNames = [
  "typescript-fetch",
  "typescript-axios",
  "typescript-angular",
  "typescript-koa",
  "typescript-express",
  "typescript-nextjs",
] as const satisfies Array<keyof typeof templates>
