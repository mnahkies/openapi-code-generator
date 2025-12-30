import util from "node:util"

export type LoggerMeta = Record<string, unknown>

enum Color {
  FgRed = "\x1b[31m",
  FgYellow = "\x1b[33m",
  Reset = "\x1b[0m",
}

const ConsoleSink = {
  info: (it: string) => console.info(it),
  warn: (it: string) => console.info(it),
  error: (it: string) => console.info(it),
}

const shouldColor = (isTTY: boolean) => {
  if (process.env.NO_COLOR) {
    return false
  }

  if (process.env.NODE_DISABLE_COLORS) {
    return false
  }

  if (process.env.TERM === "dumb") {
    return false
  }

  return isTTY
}

export class Logger {
  private readonly startTime = this.now()
  private readonly times: [string, bigint, ...bigint[]][] = []

  constructor(
    private readonly isTTY: boolean,
    private readonly format = defaultFormat,
    private readonly sink = ConsoleSink,
  ) {}

  readonly info = (message: string, meta?: LoggerMeta): void => {
    this.sink.info(this.format("info", message, meta, shouldColor(this.isTTY)))
  }

  readonly warn = (message: string, meta?: LoggerMeta): void => {
    this.sink.warn(
      this.format(
        "warn",
        message,
        meta,
        shouldColor(this.isTTY),
        Color.FgYellow,
      ),
    )
  }

  readonly error = (message: string, meta?: LoggerMeta): void => {
    this.sink.error(
      this.format("error", message, meta, shouldColor(this.isTTY), Color.FgRed),
    )
  }

  readonly time = (description: string): void => {
    const now = this.now()
    this.endTime()
    this.info(`begin '${description}'`)

    this.times.push([description, now])
  }

  readonly endTime = (now: bigint = this.now()): void => {
    const last = this.times[this.times.length - 1]
    if (last && last.length < 3) {
      last.push(now)
      this.info(`complete '${last[0]}'`, {
        elapsed: diff(last[1], now),
      })
    }
  }

  toJSON(): Record<string, string> {
    const now = this.now()
    const total = diff(this.startTime, now)

    return this.times.reduce(
      (result, [description, startTime, endTime], i) => {
        const ms = diff(startTime, endTime || now)

        result[`${i} - ${description}`] = `${ms} ms, ${Math.round(
          (ms / total) * 100,
        )}%`

        return result
      },
      {total: `${total} ms`} as Record<string, string>,
    )
  }

  private now() {
    if (typeof process.hrtime === "undefined") {
      return BigInt(Date.now())
    }
    return process.hrtime.bigint()
  }
}

function defaultFormat(
  level: string,
  message: string,
  meta?: LoggerMeta,
  useColor: boolean = true,
  color = Color.Reset,
) {
  return `${useColor ? color : ""}[${level}]${useColor ? Color.Reset : ""} ${message} ${
    meta ? util.inspect(meta, false, 3, useColor) : ""
  }`
}

function diff(start: bigint, end: bigint) {
  return Number((end - start) / BigInt(1000000))
}

export const logger = new Logger(process.stdout.isTTY)
