// biome-ignore lint/style/useNodejsImportProtocol: keep webpack happy
import EventEmitter from "events"
import type {IFsAdaptor} from "./fs-adaptor"

export class WebFsAdaptor implements IFsAdaptor {
  private readonly emitter = new EventEmitter()

  constructor(private readonly files = new Map<string, string>()) {}

  async readFile(path: string) {
    return this.files.get(path) || ""
  }

  async writeFile(
    path: string,
    content: string,
    skipEvent = false,
  ): Promise<void> {
    this.files.set(path, content)
    if (!skipEvent) {
      this.emitter.emit("change", {filename: path, value: content})
    }
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

  onFileChanged(handler: (event: {filename: string; value: string}) => void) {
    this.emitter.on("change", handler)
  }

  offFileChanged(handler: (event: {filename: string; value: string}) => void) {
    this.emitter.off("change", handler)
  }
}
