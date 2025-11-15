import pathModule from "node:path"
import type {IFsAdaptor} from "./fs-adaptor"

export class WebFsAdaptor implements IFsAdaptor {
  constructor(readonly files = new Map<string, string>()) {}

  clearFiles(filter: (it: string) => boolean) {
    for (const file of this.files.keys()) {
      if (filter(file)) {
        this.files.delete(file)
      }
    }
  }

  async readFile(path: string) {
    return this.files.get(path) || ""
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content)
  }

  async exists(path: string) {
    return this.files.has(path)
  }

  existsSync(path: string) {
    return this.files.has(path)
  }

  async mkDir() {
    /*noop*/
  }

  resolve(request: string, fromDir: string): string {
    return pathModule.normalize(pathModule.resolve(fromDir, request))
  }
}
