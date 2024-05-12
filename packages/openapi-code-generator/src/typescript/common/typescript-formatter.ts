import {Biome, Distribution} from "@biomejs/js-api"
import {logger} from "../../core/logger"

export class TypescriptFormatter {
  private constructor(private readonly biome: Biome) {
    biome.applyConfiguration({
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
      javascript: {
        formatter: {
          bracketSpacing: true,
          semicolons: "asNeeded",
        },
      },
    })
  }

  async format(filename: string, raw: string): Promise<string> {
    try {
      raw = raw
        .split("\n")
        .map((it) => it.trim())
        .join("\n")
      const formatted = this.biome.formatContent(raw, {
        filePath: filename,
      })

      return formatted.content
    } catch (err) {
      logger.error("failed to format", {err})
      return raw
    }
  }

  static async createNodeFormatter(): Promise<TypescriptFormatter> {
    const biome = await Biome.create({
      distribution: Distribution.NODE,
    })

    return new TypescriptFormatter(biome)
  }

  static async createWebFormatter(): Promise<TypescriptFormatter> {
    const biome = await Biome.create({
      distribution: Distribution.WEB,
    })

    return new TypescriptFormatter(biome)
  }
}
