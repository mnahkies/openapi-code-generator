// biome-ignore lint/style/useNodejsImportProtocol: keep webpack happy
import util from "util"

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

export class Logger {
  private readonly startTime = this.now()
  private readonly times: [string, bigint, ...bigint[]][] = []

  constructor(
    private readonly format = defaultFormat,
    private readonly sink = ConsoleSink,
  ) {}

  readonly info = (message: string, meta?: LoggerMeta): void => {
    this.sink.info(this.format("info", message, meta))
  }

  readonly warn = (message: string, meta?: LoggerMeta): void => {
    this.sink.warn(this.format("warn", message, meta, Color.FgYellow))
  }

  readonly error = (message: string, meta?: LoggerMeta): void => {
    this.sink.error(this.format("error", message, meta, Color.FgRed))
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
  color = Color.Reset,
) {
  return `${color}[${level}]${Color.Reset} ${message} ${
    meta ? util.inspect(meta) : ""
  }`
}

function diff(start: bigint, end: bigint) {
  return Number((end - start) / BigInt(1000000))
}

export const logger = new Logger()
