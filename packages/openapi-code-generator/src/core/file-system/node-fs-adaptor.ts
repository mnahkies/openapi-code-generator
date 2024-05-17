// eslint-disable-next-line no-restricted-imports
import {existsSync} from "node:fs"
// eslint-disable-next-line no-restricted-imports
import fs from "node:fs/promises"
import {IFsAdaptor} from "./fs-adaptor"

export class NodeFsAdaptor implements IFsAdaptor {
  async readFile(path: string) {
    return await fs.readFile(path, "utf-8")
  }

  async writeFile(path: string, content: string) {
    await fs.writeFile(path, content, "utf-8")
  }

  async exists(path: string) {
    const stat = await fs.stat(path)
    return stat.isFile()
  }

  existsSync(path: string) {
    return existsSync(path)
  }

  async mkDir(path: string, recursive = true) {
    await fs.mkdir(path, {recursive})
  }
}
