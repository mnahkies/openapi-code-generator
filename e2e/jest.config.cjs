const base = require("../jest.base")
const {name: displayName} = require("./package.json")

/**
 * @type { import('@jest/types').Config.ProjectConfig }
 */
const config = {
  ...base,
  displayName,
}

module.exports = config
