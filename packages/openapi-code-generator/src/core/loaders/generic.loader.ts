// biome-ignore lint/style/useNodejsImportProtocol: webpack doesn't like `node:` prefix
import path from "path"
import yaml from "js-yaml"
import json5 from "json5"
import type {IFsAdaptor} from "../file-system/fs-adaptor"
import {logger} from "../logger"
import {isRemote} from "./utils"

export class GenericLoader {
  constructor(private readonly fsAdaptor: IFsAdaptor) {}

  async loadFile(location: string): Promise<[string, unknown]> {
    if (isRemote(location)) {
      return this.loadRemoteFile(location)
    }
    return this.loadLocalFile(location)
  }

  private async loadLocalFile(file: string): Promise<[string, unknown]> {
    const resolvedPath = path.resolve(file)
    const raw = await this.fsAdaptor.readFile(resolvedPath)

    return [resolvedPath, await this.parseFile(raw, resolvedPath)]
  }

  private async loadRemoteFile(uri: string): Promise<[string, unknown]> {
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
      } catch (err: unknown) {
        logger.error("error parsing json", {err})
        throw new Error(`failed to parse json from '${filepath}'`)
      }
    }

    if (filepath.endsWith(".yaml") || filepath.endsWith(".yml")) {
      try {
        result = yaml.load(raw)
      } catch (err: unknown) {
        logger.error("error parsing yaml", {err})
        throw new Error(`failed to parse yaml from '${filepath}'`)
      }
    }

    if (!result) {
      throw new Error(`failed to parse '${filepath}'`)
    }

    return result
  }
}
