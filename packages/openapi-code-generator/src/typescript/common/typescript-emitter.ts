import path from "path"
import {IFsAdaptor} from "../../core/file-system/fs-adaptor"
import {logger} from "../../core/logger"
import {CompilationUnit} from "./compilation-units"
import {TypescriptFormatter} from "./typescript-formatter"

export class TypescriptEmitter {
  constructor(
    private readonly fsAdaptor: IFsAdaptor,
    private readonly formatter: TypescriptFormatter,
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

    logger.time("format output")

    for (const output of outputs) {
      output.data = await this.formatter.format(output.filename, output.data)
    }

    logger.time("write output")

    for (const output of outputs) {
      await this.writeOutput(output.filename, output.data)
    }
  }

  private async writeOutput(filename: string, data: string) {
    const outputDirectory = path.dirname(
      path.join(this.config.destinationDirectory, filename),
    )
    const outputFilepath = path.join(this.config.destinationDirectory, filename)

    await this.fsAdaptor.mkDir(outputDirectory, true)
    await this.fsAdaptor.writeFile(outputFilepath, data)

    logger.info(`Wrote ${outputFilepath}`)
  }
}