import path from "path"
import fs from "fs"
import yaml from "js-yaml"
import {logger} from "./logger"

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

  let result: any | undefined

  if (file.endsWith(".json")) {
    try {
      result = JSON.parse(raw)
    } catch (err: any) {
      logger.error("error parsing json", err.stack)
      throw new Error(`failed to parse json from file '${file}'`)
    }
  }

  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    try {
      result = yaml.load(raw)
    } catch (err: any) {
      logger.error("error parsing yaml", err.stack)
      throw new Error(`failed to parse yaml from file '${file}'`)
    }
  }

  if (!result) {
    throw new Error(`failed to load file '${file}'`)
  }

  return [file, result]
}

async function loadRemoteFile(uri: string): Promise<[string, any]> {
  // todo not implemented
  throw new Error(`could not load ${uri} - not implemented,`)
}

export function isRemote(location: string): boolean {
  return location.startsWith("http://") || location.startsWith("https://")
}
