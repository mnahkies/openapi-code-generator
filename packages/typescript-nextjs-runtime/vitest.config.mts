import {defineConfig} from "vitest/config"
import {baseTestConfig} from "../../vitest.base"
import pkg from "./package.json" with {type: "json"}

export default defineConfig({
  test: {
    ...baseTestConfig.test,
    name: pkg.name,
  },
})
