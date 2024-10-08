const inspector = require("node:inspector")

/**
 * @type { import('@jest/types').Config.GlobalConfig }
 */
const config = {
  projects: ["packages/*/jest.config.js"],
  testTimeout: inspector.url() ? 5 * 60 * 1000 : 5 * 1000,
  reporters: ["./jest/reporter.js"],
}

module.exports = config
