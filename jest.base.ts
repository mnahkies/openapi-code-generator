import type {JestConfigWithTsJest} from "ts-jest"

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "node",
  resetMocks: true,
  testMatch: ["**/*.spec.ts"]
}

module.exports = config
