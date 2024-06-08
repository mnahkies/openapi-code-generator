const {DefaultReporter} = require("@jest/reporters")

class Reporter extends DefaultReporter {
  printTestFileHeader(_testPath, _config, result) {
    // silence console output from tests that passed
    if (result.numFailingTests === 0 && !result.testExecError) {
      result.console = []
    } else {
      // biome-ignore lint/style/noArguments: <explanation>
      super.printTestFileHeader(...arguments)
    }
  }
}

module.exports = Reporter
