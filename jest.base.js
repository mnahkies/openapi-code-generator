/**
 * @type { import('@jest/types').Config.ProjectConfig }
 */
const config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  resetMocks: true,
  testMatch: ["**/*.spec.ts"],
}

module.exports = config
