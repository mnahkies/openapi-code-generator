import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import {logger} from "./logger"
import ts from "typescript"
import json5 from "json5"
import {
  TsCompilerOptions,
  TsConfig,
  tsconfigSchema,
} from "./schemas/tsconfig-schema"

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
  // todo: https://github.com/mnahkies/openapi-code-generator/issues/43
  throw new Error(`could not load ${uri} - not implemented,`)
}

export function isRemote(location: string): boolean {
  return location.startsWith("http://") || location.startsWith("https://")
}

export type CompilerOptions = Pick<
  TsCompilerOptions,
  "exactOptionalPropertyTypes"
>

export function loadTsConfigCompilerOptions(
  searchPath: string,
): CompilerOptions {
  const defaults = {exactOptionalPropertyTypes: false}

  try {
    const path = ts.findConfigFile(searchPath, (it) => fs.existsSync(it))

    if (path) {
      return loadTsConfig(path).compilerOptions
    }

    logger.warn(`no tsconfig.json found for ${searchPath}, using defaults`, {
      compilerOptions: defaults,
    })
  } catch (err) {
    logger.warn(
      `failed to load tsconfig.json for ${searchPath}, using defaults`,
      {
        compilerOptions: defaults,
      },
    )
  }

  return defaults
}

function loadTsConfig(configPath: string): TsConfig {
  const config = tsconfigSchema.parse(
    json5.parse(fs.readFileSync(configPath, "utf-8")),
  )
  const configExtends = (
    typeof config.extends === "string" ? [config.extends] : config.extends ?? []
  )
    .map((it) => require.resolve(it, {paths: [path.dirname(configPath)]}))
    .map(loadTsConfig)
  configExtends.push(config)

  return configExtends.reduce((acc, it) => ({
    compilerOptions: {...acc.compilerOptions, ...it.compilerOptions},
  }))
}
