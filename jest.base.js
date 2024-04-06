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
  // Note: prettier is required for inline snapshot indentation to work correctly
  prettierPath: require.resolve("prettier"),
}

module.exports = config
