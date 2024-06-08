import type {IFormatter} from "../../core/interfaces"
import {logger} from "../../core/logger"
const prettier = require("prettier/standalone")
const plugins = [
  require("prettier/plugins/estree"),
  require("prettier/plugins/typescript"),
]

export class TypescriptFormatterPrettier implements IFormatter {
  private constructor() {}

  async format(filename: string, raw: string): Promise<string> {
    try {
      const trimmed = raw
        .split("\n")
        .map((it) => it.trim())
        .join("\n")

      return prettier.format(trimmed, {
        semi: false,
        arrowParens: "always",
        parser: "typescript",
        plugins,
      })
    } catch (err) {
      logger.error("failed to format", {err})
      return raw
    }
  }

  static async create(): Promise<TypescriptFormatterPrettier> {
    return new TypescriptFormatterPrettier()
  }
}
