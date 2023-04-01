import base = require( "../../jest.base")
import {JestConfigWithTsJest} from "ts-jest"
import {name as displayName} from "./package.json"

const config: JestConfigWithTsJest = {
  ...base,
  displayName
}

module.exports = config
