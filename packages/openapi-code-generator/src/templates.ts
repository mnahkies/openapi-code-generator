import {generateTypescriptAngular} from "./typescript/typescript-angular/typescript-angular.generator"
import {generateTypescriptFetch} from "./typescript/typescript-fetch/typescript-fetch.generator"
import {generateTypescriptKoa} from "./typescript/typescript-koa/typescript-koa.generator"
import {OpenapiGenerator} from "./templates.types"
import {generateTypescriptAxios} from "./typescript/typescript-axios/typescript-axios.generator"

export const templates = {
  "typescript-fetch": generateTypescriptFetch,
  "typescript-axios": generateTypescriptAxios,
  "typescript-angular": generateTypescriptAngular,
  "typescript-koa": generateTypescriptKoa,
} satisfies Record<string, OpenapiGenerator>
