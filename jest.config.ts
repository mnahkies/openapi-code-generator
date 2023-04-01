import type {JestConfigWithTsJest} from "ts-jest"
import inspector from "inspector"

const config: JestConfigWithTsJest = {
  projects: ["packages/*/jest.config.ts"],
  testTimeout: inspector.url() ? 5 * 60 * 1000 : 5 * 1000,
}

module.exports = config
