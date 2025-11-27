import {defineConfig, defineProject} from "vitest/config"
import {baseTestConfig} from "./vitest.base"

const packageFactory = (name: string) =>
  defineProject({
    root: `./packages/${name}`,
    test: {
      ...baseTestConfig.test,
      name: `@nahkies/${name}`,
    },
  })

export default defineConfig({
  test: {
    projects: [
      packageFactory("openapi-code-generator"),
      packageFactory("typescript-axios-runtime"),
      packageFactory("typescript-express-runtime"),
      packageFactory("typescript-fetch-runtime"),
      packageFactory("typescript-koa-runtime"),
    ],
  },
})
