import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

export const filename = path.resolve(__filename)

export default function typecheck(
  compilationUnits: {filename: string; content: string}[],
) {
  const files: Record<string, string> = {}

  for (const unit of compilationUnits) {
    files[path.resolve(unit.filename)] = unit.content
  }

  const fileNames = Object.keys(files)

  const compilerHost = ts.createCompilerHost({}, true)

  const readFile = (fileName: string): string => {
    const file = files[fileName]

    if (
      file === undefined &&
      fileName.startsWith("/") &&
      fs.existsSync(fileName)
    ) {
      return fs.readFileSync(fileName, "utf-8").toString()
    }

    if (file === undefined) {
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
