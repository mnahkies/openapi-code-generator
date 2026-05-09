import type {IFormatter} from "../../core/interfaces.ts"
import {logger} from "../../core/logger.ts"

export class TypescriptFormatterPrettier implements IFormatter {
  private constructor(
    // biome-ignore lint/suspicious/noExplicitAny: not important
    private readonly prettier: any,
    // biome-ignore lint/suspicious/noExplicitAny: not important
    private readonly plugins: any[],
  ) {}

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
    const [prettier, estree, typescript] = await Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/estree"),
      import("prettier/plugins/typescript"),
    ])

    return new TypescriptFormatterPrettier(prettier.default ?? prettier, [
      estree.default ?? estree,
      typescript.default ?? typescript,
    ])
  }
}
