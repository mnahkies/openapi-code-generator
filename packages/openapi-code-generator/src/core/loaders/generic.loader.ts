// Note: we can get away with using this in NextJS it seems, but not if using the `node:` prefix
import path from "path"
import yaml from "js-yaml"
import json5 from "json5"
import {IFsAdaptor} from "../file-system/fs-adaptor"
import {logger} from "../logger"
import {isRemote} from "./utils"

export class GenericLoader {
  constructor(private readonly fsAdaptor: IFsAdaptor) {}

  async loadFile(location: string): Promise<[string, any]> {
    if (isRemote(location)) {
      return this.loadRemoteFile(location)
    } else {
      return this.loadLocalFile(location)
    }
  }

  private async loadLocalFile(file: string): Promise<[string, any]> {
    file = path.resolve(file)
    const raw = await this.fsAdaptor.readFile(file)

    return [file, await this.parseFile(raw, file)]
  }

  private async loadRemoteFile(uri: string): Promise<[string, any]> {
    const res = await fetch(uri)

    if (!res.ok) {
      throw new Error(`failed to fetch remote file '${uri}'`)
    }

    const raw = await res.text()

    return [uri, await this.parseFile(raw, uri)]
  }

  private async parseFile(raw: string, filepath: string): Promise<unknown> {
    let result: unknown | undefined

    // TODO: sniff format from raw text
    if (filepath.endsWith(".json")) {
      try {
        result = json5.parse(raw)
      } catch (err: any) {
        logger.error("error parsing json", err.stack)
        throw new Error(`failed to parse json from '${filepath}'`)
      }
    }

    if (filepath.endsWith(".yaml") || filepath.endsWith(".yml")) {
      try {
        result = yaml.load(raw)
      } catch (err: any) {
        logger.error("error parsing yaml", err.stack)
        throw new Error(`failed to parse yaml from '${filepath}'`)
      }
    }

    if (!result) {
      throw new Error(`failed to parse '${filepath}'`)
    }

    return result
  }
}
