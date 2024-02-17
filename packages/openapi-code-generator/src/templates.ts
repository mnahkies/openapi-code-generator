import {OpenapiGenerator} from "./templates.types"
import {generateTypescriptAngular} from "./typescript/typescript-angular/typescript-angular.generator"
import {generateTypescriptAxios} from "./typescript/typescript-axios/typescript-axios.generator"
import {generateTypescriptFetch} from "./typescript/typescript-fetch/typescript-fetch.generator"
import {generateTypescriptKoa} from "./typescript/typescript-koa/typescript-koa.generator"

export const templates = {
  "typescript-fetch": generateTypescriptFetch,
  "typescript-axios": generateTypescriptAxios,
  "typescript-angular": generateTypescriptAngular,
  "typescript-koa": generateTypescriptKoa,
} satisfies Record<string, OpenapiGenerator>
