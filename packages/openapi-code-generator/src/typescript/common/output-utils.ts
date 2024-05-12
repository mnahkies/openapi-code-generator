import fs from "fs"
import path from "path"
import {Biome, Distribution} from "@biomejs/js-api"
import {logger} from "../../core/logger"
import {CompilationUnit} from "./compilation-units"

export async function emitGenerationResult(
  dest: string,
  units: CompilationUnit[],
  config: {allowUnusedImports: boolean},
): Promise<void> {
  const outputs = units
    .filter((it) => it.hasCode())
    .map((unit) => {
      return {
        filename: unit.filename,
        data: unit.getRawFileContent(config),
      }
    })

  logger.time("format output")

  for (const output of outputs) {
    output.data = await formatOutput(output.data, output.filename)
  }

  logger.time("write output")

  for (const output of outputs) {
    await writeOutput(dest, output.filename, output.data)
  }
}

export async function formatOutput(
  raw: string,
  filename: string,
): Promise<string> {
  try {
    raw = raw
      .split("\n")
      .map((it) => it.trim())
      .join("\n")
    const biome = await Biome.create({
      distribution: Distribution.NODE,
    })

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

    const formatted = biome.formatContent(raw, {
      filePath: filename,
    })

    return formatted.content
  } catch (err) {
    logger.error("failed to format", {err})
    return raw
  }
}

async function writeOutput(
  baseDirectory: string,
  filename: string,
  data: string,
) {
  const outputDirectory = path.dirname(path.join(baseDirectory, filename))
  const outputFilepath = path.join(baseDirectory, filename)

  fs.mkdirSync(outputDirectory, {recursive: true})

  fs.writeFileSync(outputFilepath, data, {
    encoding: "utf-8",
  })

  logger.info(`Wrote ${outputFilepath}`)
}
