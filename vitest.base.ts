import * as inspector from "node:inspector"
import {defineProject} from "vitest/config"

export const baseTestConfig = defineProject({
  test: {
    environment: "node",
    include: ["**/*.spec.ts", "**/*.integration.ts"],
    globals: false,
    mockReset: true,
    testTimeout: inspector.url() ? 5 * 60 * 1000 : 5 * 1000,
  },
})
