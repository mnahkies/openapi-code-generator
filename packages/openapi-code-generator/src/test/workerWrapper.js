const tsx = require("tsx/cjs/api")
const {workerData} = require("node:worker_threads")

module.exports = tsx.require(workerData.fullpath, __filename)
