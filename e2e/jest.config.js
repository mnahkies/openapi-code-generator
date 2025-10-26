import base from "../jest.base.js"
import pkg from "./package.json" with {type: "json"}

/**
 * @type { import('@jest/types').Config.ProjectConfig }
 */
const config = {
  ...base,
  displayName: pkg.name,
}

export default config
