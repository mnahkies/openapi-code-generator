import json5 from "json5"
import type {IFsAdaptor} from "../file-system/fs-adaptor.ts"
import {logger} from "../logger.ts"

export type TypescriptFormatterConfig =
  // biome-ignore lint/suspicious/noExplicitAny: not important
  | {type: "biome"; config: any}
  // biome-ignore lint/suspicious/noExplicitAny: not important
  | {type: "prettier"; config: any}
  | null

export async function loadTypescriptFormatterConfig(
  searchPath: string,
  fsAdaptor: IFsAdaptor,
): Promise<TypescriptFormatterConfig> {
  const biomeConfigFile = findConfigFile(
    ["biome.json", "biome.jsonc"],
    searchPath,
    fsAdaptor,
  )

  if (biomeConfigFile) {
    const rawConfig = await fsAdaptor.readFile(biomeConfigFile)

    return {
      type: "biome",
      config: json5.parse(rawConfig),
    }
  }

  const prettierConfigFile = findConfigFile(
    [
      ".prettierrc.js",
      "prettier.config.js",
      ".prettierrc.cjs",
      "prettier.config.cjs",
      ".prettierrc",
      ".prettierrc.json",
      ".prettierrc.yaml",
      ".prettierrc.yml",
    ],
    searchPath,
    fsAdaptor,
  )

  if (prettierConfigFile) {
    try {
      const prettier = await import("prettier")

      return {
        type: "prettier",
        config: (await prettier.resolveConfig(prettierConfigFile)) ?? {},
      }
    } catch (err) {
      logger.error("failed to load prettier config", {err})
    }
  }

  return null
}

export function findConfigFile(
  names: string[],
  searchPath: string,
  fsAdaptor: IFsAdaptor,
) {
  if (searchPath === fsAdaptor.dirname(searchPath)) {
    return null
  }

  for (const name of names) {
    const fullPath = fsAdaptor.pathJoin(searchPath, name)
    if (fsAdaptor.existsSync(fullPath)) {
      logger.info(`found ${fullPath} in ${searchPath}`)
      return fullPath
    }
  }

  return findConfigFile(names, fsAdaptor.dirname(searchPath), fsAdaptor)
}
