import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest"
import {Logger} from "./logger.ts"

describe("Logger", () => {
  let sink: {info: Mock; warn: Mock; error: Mock}

  beforeEach(() => {
    sink = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("should include color escape sequences by default (assuming TTY)", () => {
    vi.stubEnv("NO_COLOR", undefined)
    vi.stubEnv("NODE_DISABLE_COLORS", undefined)
    vi.stubEnv("TERM", "xterm")
    const logger = new Logger(true, undefined, sink)

    logger.warn("test message")

    expect(sink.warn).toHaveBeenCalledWith(
      expect.stringContaining("\x1b[33m[warn]\x1b[0m test message "),
    )
  })

  it("should strip color escape sequences when NO_COLOR is set", () => {
    vi.stubEnv("NO_COLOR", "1")
    const logger = new Logger(true, undefined, sink)

    logger.warn("test message")

    expect(sink.warn).toHaveBeenCalledWith("[warn] test message ")
  })

  it("should strip color escape sequences when NODE_DISABLE_COLORS is set", () => {
    vi.stubEnv("NODE_DISABLE_COLORS", "1")
    const logger = new Logger(true, undefined, sink)

    logger.warn("test message")

    expect(sink.warn).toHaveBeenCalledWith("[warn] test message ")
  })

  it("should strip color escape sequences when TERM is dumb", () => {
    vi.stubEnv("TERM", "dumb")
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
