import fs from "node:fs"
import path from "node:path"
import ts from "typescript"
import type {CompilationUnit} from "../typescript/common/compilation-units"
import {TypescriptFormatterBiome} from "../typescript/common/typescript-formatter.biome"

export async function typecheck(compilationUnits: CompilationUnit[]) {
  const formatter = await TypescriptFormatterBiome.createNodeFormatter()

  const files: Record<string, string> = {}

  for (const unit of compilationUnits) {
    const formatted = await formatter.format(
      unit.filename,
      unit.getRawFileContent({
        allowUnusedImports: false,
        includeHeader: false,
      }),
    )

    if (formatted.err) {
      throw formatted.err
    }

    files[path.resolve(unit.filename)] = formatted.result
  }

  const fileNames = Object.keys(files)

  const compilerHost = ts.createCompilerHost({}, true)

  const readFile = (fileName: string): string => {
    const file = files[fileName]

    if (!file && fileName.startsWith("/") && fs.existsSync(fileName)) {
      return fs.readFileSync(fileName, "utf-8").toString()
    }

    if (!file) {
      throw new Error(`file '${fileName}' not found`)
    }

    return file
  }

  compilerHost.readFile = readFile

  compilerHost.fileExists = (fileName: string) => {
    return fileName in files
  }

  compilerHost.getSourceFile = (fileName, languageVersion) => {
    const file = readFile(fileName)

    return ts.createSourceFile(fileName, file, languageVersion)
  }

  compilerHost.writeFile = () => {
    /* noop */
  }

  const program = ts.createProgram({
    rootNames: fileNames,
    options: {
      noEmit: true,
      strict: true,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
      types: [],
    },
    host: compilerHost,
  })

  const diagnostics = ts.getPreEmitDiagnostics(program)

  if (diagnostics.length > 0) {
    const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => "",
      getCanonicalFileName: (fileName) => fileName,
      getNewLine: () => "\n",
    })
    throw new Error(`TypeScript compilation failed:\n\n${formatted}`)
  }
}
