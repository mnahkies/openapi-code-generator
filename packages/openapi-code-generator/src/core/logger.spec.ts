import {afterAll, beforeEach, describe, expect, it, jest} from "@jest/globals"
import {Logger} from "./logger"

describe("Logger", () => {
  let sink: {info: jest.Mock; warn: jest.Mock; error: jest.Mock}

  beforeEach(() => {
    sink = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("should include color escape sequences by default (assuming TTY)", () => {
    const logger = new Logger(true, undefined, sink)

    logger.warn("test message")

    expect(sink.warn).toHaveBeenCalledWith(
      expect.stringContaining("\x1b[33m[warn]\x1b[0m test message"),
    )
  })

  it("should strip color escape sequences when NO_COLOR is set", () => {
    jest.replaceProperty(process, "env", {...process.env, NO_COLOR: "1"})
    const logger = new Logger(true, undefined, sink)

    logger.warn("test message")

    expect(sink.warn).toHaveBeenCalledWith("[warn] test message ")
  })

  it("should strip color escape sequences when NODE_DISABLE_COLORS is set", () => {
    jest.replaceProperty(process, "env", {
      ...process.env,
      NODE_DISABLE_COLORS: "1",
    })
    const logger = new Logger(true, undefined, sink)

    logger.warn("test message")

    expect(sink.warn).toHaveBeenCalledWith("[warn] test message ")
  })

  it("should strip color escape sequences when TERM is dumb", () => {
    jest.replaceProperty(process, "env", {...process.env, TERM: "dumb"})
    const logger = new Logger(true, undefined, sink)

    logger.warn("test message")

    expect(sink.warn).toHaveBeenCalledWith("[warn] test message ")
  })

  it("should strip color escape sequences when not a TTY", () => {
    const logger = new Logger(false, undefined, sink)

    logger.warn("test message")

    expect(sink.warn).toHaveBeenCalledWith("[warn] test message ")
  })
})
