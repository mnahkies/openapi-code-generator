import path from "node:path"
import json5 from "json5"
import ts from "typescript"
import type {IFsAdaptor} from "../file-system/fs-adaptor"
import {logger} from "../logger"
import {
  type TsCompilerOptions,
  type TsConfig,
  tsconfigSchema,
} from "../schemas/tsconfig.schema"

export type CompilerOptions = Pick<
  TsCompilerOptions,
  "exactOptionalPropertyTypes" | "rewriteRelativeImportExtensions" | "paths"
>

export async function loadTsConfigCompilerOptions(
  searchPath: string,
  fsAdaptor: IFsAdaptor,
): Promise<CompilerOptions> {
  const defaults = {
    exactOptionalPropertyTypes: false,
    rewriteRelativeImportExtensions: false,
  }

  try {
    const path = ts.findConfigFile(searchPath, (it) => fsAdaptor.existsSync(it))

    if (path) {
      const compilerOptions = (await loadTsConfig(path, fsAdaptor))
        .compilerOptions
      return {...defaults, ...compilerOptions}
    }

    logger.warn(`no tsconfig.json found for ${searchPath}, using defaults`, {
      compilerOptions: defaults,
    })
  } catch (err) {
    logger.warn(
      `failed to load tsconfig.json for ${searchPath}, using defaults`,
      {
        compilerOptions: defaults,
        err,
      },
    )
  }

  return defaults
}

async function loadTsConfig(
  configPath: string,
  fsAdaptor: IFsAdaptor,
): Promise<TsConfig> {
  const config = tsconfigSchema.parse(
    json5.parse(await fsAdaptor.readFile(configPath)),
  )

  const configExtends = await Promise.all(
    (typeof config.extends === "string"
      ? [config.extends]
      : (config.extends ?? [])
    )
      .map((it) => fsAdaptor.resolve(it, path.dirname(configPath)))
      .map((it) => loadTsConfig(it, fsAdaptor)),
  )

  configExtends.push(config)

  return configExtends.reduce((acc, it) => ({
    compilerOptions: {...acc.compilerOptions, ...it.compilerOptions},
  }))
}
