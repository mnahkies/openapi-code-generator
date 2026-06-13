import path from "node:path"
import {WebFsAdaptor} from "./web-fs-adaptor.ts"

export function testFsAdaptor(
  files: Record<string, string>,
  sep: typeof path.sep = "/",
) {
  return new WebFsAdaptor(
    new Map(Object.entries(files)),
    sep === "/" ? path.posix.join : path.win32.join,
    sep === "/" ? path.posix.dirname : path.win32.dirname,
  )
}
