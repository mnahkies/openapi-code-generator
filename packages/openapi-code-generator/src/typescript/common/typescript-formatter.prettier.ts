import type {IFormatter} from "../../core/interfaces"
import {logger} from "../../core/logger"

export class TypescriptFormatterPrettier implements IFormatter {
  // biome-ignore lint/suspicious/noExplicitAny: not important
  prettier: any
  // biome-ignore lint/suspicious/noExplicitAny: not important
  plugins: any[]

  private constructor() {
    this.prettier = require("prettier/standalone")
    this.plugins = [
      require("prettier/plugins/estree"),
      require("prettier/plugins/typescript"),
    ]
  }

  async format(
    filename: string,
    raw: string,
  ): Promise<{result: string; err?: Error}> {
    const trimmed = raw
      .split("\n")
      .map((it) => it.trim())
      .join("\n")

    try {
      const formatted = await this.prettier.format(trimmed, {
        semi: false,
        arrowParens: "always",
        parser: "typescript",
        plugins: this.plugins,
      })

      return {result: formatted}
    } catch (err) {
      logger.error("failed to format", {err})
      return {
        result: trimmed,
        err: new Error(`failed to format ${filename}`, {cause: err}),
      }
    }
  }

  static async create(): Promise<TypescriptFormatterPrettier> {
    return new TypescriptFormatterPrettier()
  }
}
