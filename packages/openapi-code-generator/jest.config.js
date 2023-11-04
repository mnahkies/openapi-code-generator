// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require( "../../jest.base")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {name: displayName} = require("./package.json")

/**
 * @type { import('@jest/types').Config.ProjectConfig }
 */
const config = {
  ...base,
  displayName,
}

module.exports = config
