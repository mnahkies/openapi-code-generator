import fs from "fs"
import path from "path"
import json5 from "json5"
import ts from "typescript"
import {logger} from "../logger"
import {
  TsCompilerOptions,
  TsConfig,
  tsconfigSchema,
} from "../schemas/tsconfig.schema"

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
