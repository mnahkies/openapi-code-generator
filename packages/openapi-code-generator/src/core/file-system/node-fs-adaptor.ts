import {existsSync} from "node:fs"

import fs from "node:fs/promises"
import type {IFsAdaptor} from "./fs-adaptor"

export class NodeFsAdaptor implements IFsAdaptor {
  async readFile(path: string) {
    return await fs.readFile(path, "utf-8")
  }

  async writeFile(path: string, content: string) {
    await fs.writeFile(path, content, "utf-8")
  }

  async exists(path: string) {
    try {
      const stat = await fs.stat(path)
      return stat.isFile()
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        Reflect.get(err, "code") === "ENOENT"
      ) {
        return false
      }
      throw err
    }
  }

  existsSync(path: string) {
    return existsSync(path)
  }

  async mkDir(path: string, recursive = true) {
    await fs.mkdir(path, {recursive})
  }
}
