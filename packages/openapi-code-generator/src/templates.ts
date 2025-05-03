import type {OpenapiGenerator} from "./templates.types"
import {generateTypescriptAngular} from "./typescript/client/typescript-angular/typescript-angular.generator"
import {generateTypescriptAxios} from "./typescript/client/typescript-axios/typescript-axios.generator"
import {generateTypescriptFetch} from "./typescript/client/typescript-fetch/typescript-fetch.generator"
import {generateTypescriptKoa} from "./typescript/server/typescript-koa/typescript-koa.generator"

export const templates = {
  "typescript-fetch": {
    language: "typescript",
    type: "client",
    run: generateTypescriptFetch,
  },
  "typescript-axios": {
    language: "typescript",
    type: "client",
    run: generateTypescriptAxios,
  },
  "typescript-angular": {
    language: "typescript",
    type: "client",
    run: generateTypescriptAngular,
  },
  "typescript-koa": {
    language: "typescript",
    type: "server",
    run: generateTypescriptKoa,
  },
} satisfies {[key: string]: OpenapiGenerator}
