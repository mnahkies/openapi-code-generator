import {ImportBuilder} from "./import-builder"

export interface ICompilable {
  toCompilationUnit(): CompilationUnit
}

export type CompilationUnit = {
  filename: string
  imports: ImportBuilder | undefined
  code: string
}
