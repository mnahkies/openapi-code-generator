import path from "node:path"
import type {IFsAdaptor} from "../../core/file-system/fs-adaptor"
import type {IFormatter} from "../../core/interfaces"
import {logger} from "../../core/logger"
import type {CompilationUnit} from "./compilation-units"

export class TypescriptEmitter {
  constructor(
    private readonly fsAdaptor: IFsAdaptor,
    private readonly formatter: IFormatter,
    private readonly config: {
      destinationDirectory: string
      allowUnusedImports: boolean
    },
  ) {}

  async emitGenerationResult(units: CompilationUnit[]): Promise<void> {
    const outputs = units
      .filter((it) => it.hasCode())
      .map((unit) => {
        return {
          filename: unit.filename,
          data: unit.getRawFileContent(this.config),
        }
      })

    logger.time("format and write output")

    const result = await Promise.allSettled(
      outputs.map(async (output) => {
        const {result, err} = await this.formatter.format(
          output.filename,
          output.data,
        )
        output.data = result
        await this.writeOutput(output.filename, output.data)

        if (err) {
          throw err
        }
      }),
    )

    const error = result.find((result) => result.status === "rejected")

    if (error) {
      throw error.reason
    }
  }

  private async writeOutput(filename: string, data: string) {
    try {
      const outputDirectory = path.dirname(
        path.join(this.config.destinationDirectory, filename),
      )
      const outputFilepath = path.join(
        this.config.destinationDirectory,
        filename,
      )

      await this.fsAdaptor.mkDir(outputDirectory, true)
      await this.fsAdaptor.writeFile(outputFilepath, data)

      logger.info(`Wrote ${outputFilepath}`)
    } catch (err) {
      throw new Error(`failed to write ${filename}`, {cause: err})
    }
  }
}
