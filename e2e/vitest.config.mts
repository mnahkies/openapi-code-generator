import {defineConfig} from "vitest/config"
import {baseTestConfig} from "../vitest.base"

export default defineConfig({
  test: {
    ...baseTestConfig.test,
    name: "e2e",
  },
})
