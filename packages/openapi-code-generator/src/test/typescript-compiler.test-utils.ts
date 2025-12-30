import fs from "node:fs"
import path from "node:path"
import util from "node:util"
import ts from "typescript"

export class TestOutputTypeChecker {
  private files: Record<string, string> = {}
  private readonly sourceFileCache: Record<string, ts.SourceFile | undefined> =
    {}

  private readonly compilerHost: ts.CompilerHost
  private readonly options: ts.CompilerOptions = {
    noEmit: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    skipLibCheck: true,
    types: [],
  }
  private program: ts.Program

  constructor() {
    const defaultHost = ts.createCompilerHost(this.options, true)

    const compilerHost = {
      ...defaultHost,
      fileExists: (fileName: string) => {
        return fileName in this.files
      },
      readFile: (fileName: string): string => {
        const file = this.files[fileName]

        if (file === undefined && fileName.startsWith("/")) {
          return fs.readFileSync(fileName, "utf-8").toString()
        }

        if (file === undefined) {
          throw new Error(`file '${fileName}' not found`)
        }

        return file
      },
      writeFile: () => {
        /* noop */
      },
      getSourceFile: (fileName, languageVersion) => {
        if (this.sourceFileCache[fileName]) {
          return this.sourceFileCache[fileName]
        }

        const file = compilerHost.readFile(fileName)
        const result = ts.createSourceFile(fileName, file, languageVersion)
        this.sourceFileCache[fileName] = result

        return result
      },
    } satisfies ts.CompilerHost

    this.compilerHost = compilerHost
    this.program = ts.createProgram({
      rootNames: [],
      options: this.options,
      host: this.compilerHost,
    })
  }

  typecheck(compilationUnits: {filename: string; content: string}[]) {
    const rootNames: string[] = []

    for (const filename in this.files) {
      this.sourceFileCache[filename] = undefined
    }

    this.files = {}

    for (const unit of compilationUnits) {
      const filename = path.resolve(unit.filename)
      this.files[filename] = unit.content
      this.sourceFileCache[filename] = undefined
      rootNames.push(filename)
    }

    this.program = ts.createProgram({
      rootNames,
      options: this.options,
      host: this.compilerHost,
      oldProgram: this.program,
    })

    const diagnostics = ts.getPreEmitDiagnostics(this.program)

    if (diagnostics.length > 0) {
      const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => "",
        getCanonicalFileName: (fileName) => fileName,
        getNewLine: () => "\n",
      })
      throw new Error(
        `TypeScript compilation failed:\n\n${util.stripVTControlCharacters(formatted)}`,
      )
    }
  }
}
