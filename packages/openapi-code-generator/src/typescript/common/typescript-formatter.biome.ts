import {Biome, type Configuration, Distribution} from "@biomejs/js-api"
import type {IFormatter} from "../../core/interfaces"
import {logger} from "../../core/logger"

const defaultConfiguration = {
  organizeImports: {
    enabled: true,
  },
  files: {
    maxSize: 5 * 1024 * 1024,
  },
  formatter: {
    enabled: true,
    indentWidth: 2,
    indentStyle: "space",
  },
  linter: {
    enabled: false,
  },
  javascript: {
    formatter: {
      bracketSpacing: true,
      semicolons: "asNeeded",
    },
  },
} as const

export class TypescriptFormatterBiome implements IFormatter {
  private constructor(private readonly biome: Biome) {}

  async format(
    filename: string,
    raw: string,
  ): Promise<{result: string; err?: Error}> {
    const trimmed = raw
      .split("\n")
      .map((it) => it.trim())
      .join("\n")

    try {
      const formatted = this.biome.formatContent(trimmed, {
        filePath: filename,
      })

      return {result: formatted.content}
    } catch (err) {
      logger.error("failed to format", {err})
      return {
        result: trimmed,
        err: new Error(`failed to format ${filename}`, {cause: err}),
      }
    }
  }

  static async createNodeFormatter(
    configuration?: Configuration,
  ): Promise<TypescriptFormatterBiome> {
    const biome = await Biome.create({
      distribution: Distribution.NODE,
    })
    biome.applyConfiguration({
      ...(configuration ?? defaultConfiguration),
      files: {
        maxSize: 5 * 1024 * 1024,
      },
      linter: {enabled: false},
    })

    return new TypescriptFormatterBiome(biome)
  }

  static async createWebFormatter(): Promise<TypescriptFormatterBiome> {
    const biome = await Biome.create({
      distribution: Distribution.WEB,
    })
    biome.applyConfiguration(defaultConfiguration)

    return new TypescriptFormatterBiome(biome)
  }
}
