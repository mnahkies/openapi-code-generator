import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import json5 from "json5"
import {logger} from "../logger"
import {isRemote} from "./utils"

export async function loadFile(location: string): Promise<[string, any]> {
  if (isRemote(location)) {
    return loadRemoteFile(location)
  } else {
    return loadLocalFile(location)
  }
}

async function loadLocalFile(file: string): Promise<[string, any]> {
  file = path.resolve(file)
  const raw = fs.readFileSync(file, {encoding: "utf-8"})

  return [file, await parseFile(raw, file)]
}

async function loadRemoteFile(uri: string): Promise<[string, any]> {
  const res = await fetch(uri)

  if (!res.ok) {
    throw new Error(`failed to fetch remote file '${uri}'`)
  }

  const raw = await res.text()

  return [uri, await parseFile(raw, uri)]
}

async function parseFile(raw: string, filepath: string): Promise<unknown> {
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
