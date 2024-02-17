import util from "util"

/* eslint no-console:0 */

export type LoggerMeta = Record<string, any>

enum Color {
  FgRed = "\x1b[31m",
  FgYellow = "\x1b[33m",
  Reset = "\x1b[0m",
}

export class Logger {
  private readonly startTime = process.hrtime.bigint()
  private readonly times: [string, ...bigint[]][] = []

  constructor(private readonly format = defaultFormat) {}

  readonly info = (message: string, meta?: LoggerMeta): void => {
    process.stderr.write(this.format("info", message, meta) + "\n")
  }

  readonly warn = (message: string, meta?: LoggerMeta): void => {
    process.stderr.write(
      this.format("warn", message, meta, Color.FgYellow) + "\n",
    )
  }

  readonly error = (message: string, meta?: LoggerMeta): void => {
    process.stderr.write(
      this.format("error", message, meta, Color.FgRed) + "\n",
    )
  }

  readonly time = (description: string): void => {
    const now = process.hrtime.bigint()
    this.endTime()
    this.info(`begin '${description}'`)

    this.times.push([description, now])
  }

  readonly endTime = (now: bigint = process.hrtime.bigint()): void => {
    const last = this.times[this.times.length - 1]
    if (last?.length < 3) {
      last.push(now)
      this.info(`complete '${last[0]}'`, {
        elapsed: diff(last[1], last[2]),
      })
    }
  }

  toJSON(): Record<string, string> {
    const now = process.hrtime.bigint()
    const total = diff(this.startTime, now)

    return this.times.reduce(
      (result, [description, startTime, endTime], i) => {
        const ms = diff(startTime, endTime || now)

        result[`${i} - ${description}`] =
          `${ms} ms, ${Math.round((ms / total) * 100)}%`

        return result
      },
      {total: `${total} ms`} as Record<string, string>,
    )
  }
}

function defaultFormat(
  level: string,
  message: string,
  meta?: LoggerMeta,
  color = Color.Reset,
) {
  return `${color}[${level}]${Color.Reset} ${message} ${meta ? util.inspect(meta) : ""}`
}

function diff(start: bigint, end: bigint) {
  return Number((end - start) / BigInt(1000000))
}

export const logger = new Logger()
