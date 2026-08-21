import pathModule from "node:path"
import type {IFsAdaptor} from "./fs-adaptor.ts"

export class WebFsAdaptor implements IFsAdaptor {
  constructor(
    readonly files = new Map<string, string>(),
    readonly pathJoin = (...paths: string[]) => pathModule.join(...paths),
    readonly dirname = (path: string) => pathModule.dirname(path),
  ) {}

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

  async isDir(path: string) {
    const prefix = path.endsWith("/") ? path : `${path}/`
    return Array.from(this.files.keys()).some((it) => it.startsWith(prefix))
  }

  async readDir(path: string) {
    const prefix = path.endsWith("/") ? path : `${path}/`
    return Array.from(
      new Set(
        Array.from(this.files.keys())
          .filter((it) => it.startsWith(prefix))
          .map((it) => it.slice(prefix.length).split("/")[0])
          .filter((it): it is string => !!it),
      ),
    )
  }

  async mkDir() {
    /*noop*/
  }

  resolve(request: string, fromDir: string): string {
    return pathModule.normalize(pathModule.resolve(fromDir, request))
  }
}
