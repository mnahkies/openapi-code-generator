import { Input } from "./core/input"

import { generateTypescriptAngular } from "./typescript/typescript-angular/typescript-angular.generator"
import { generateTypescriptFetch } from "./typescript/typescript-fetch/typescript-fetch.generator"
import { generateTypescriptKoa } from "./typescript/typescript-koa/typescript-koa.generator"

export interface OpenapiGenerator {
  (args: { dest: string, input: Input }): Promise<void>
}

export const templates: Record<string, OpenapiGenerator> = {
  'typescript-fetch': generateTypescriptFetch,
  'typescript-angular': generateTypescriptAngular,
  'typescript-koa': generateTypescriptKoa,
}
