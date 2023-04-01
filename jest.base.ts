import type { JestConfigWithTsJest } from "ts-jest"

const config: JestConfigWithTsJest = {
    preset: "ts-jest",
    testEnvironment: "node",
    resetMocks: true,
}

module.exports = config
