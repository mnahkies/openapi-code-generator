import type {IFormatter} from "../../core/interfaces"
import {logger} from "../../core/logger"
const prettier = require("prettier/standalone")
const plugins = [
  require("prettier/plugins/estree"),
  require("prettier/plugins/typescript"),
]

export class TypescriptFormatterPrettier implements IFormatter {
  private constructor() {}

  async format(
    filename: string,
    raw: string,
  ): Promise<{result: string; err?: Error}> {
    const trimmed = raw
      .split("\n")
      .map((it) => it.trim())
      .join("\n")

    try {
      const formatted = await prettier.format(trimmed, {
        semi: false,
        arrowParens: "always",
        parser: "typescript",
        plugins,
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
