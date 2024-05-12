import fs from "fs"
import path from "path"
import {logger} from "../../core/logger"
import {CompilationUnit} from "./compilation-units"
import {TypescriptFormatter} from "./typescript-formatter"

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

  const formatter = await TypescriptFormatter.createNodeFormatter()

  for (const output of outputs) {
    output.data = await formatter.format(output.filename, output.data)
  }

  logger.time("write output")

  for (const output of outputs) {
    await writeOutput(dest, output.filename, output.data)
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
