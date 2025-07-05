import path from "node:path"
import stripJsonComments from "strip-json-comments"
import type {IFsAdaptor} from "../file-system/fs-adaptor"
import {logger} from "../logger"

export type TypescriptFormatterConfig =
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  | {type: "biome"; config: any}
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  | {type: "prettier"; config: any}
  | null

export async function loadTypescriptFormatterConfig(
  searchPath: string,
  fsAdaptor: IFsAdaptor,
): Promise<TypescriptFormatterConfig> {
  const biomeConfigFile = findConfigFile(
    ["biome.json", "biome.jsonc"],
    searchPath,
    (it) => fsAdaptor.existsSync(it),
  )

  if (biomeConfigFile) {
    const rawConfig = await fsAdaptor.readFile(biomeConfigFile)

    return {
      type: "biome",
      config: JSON.parse(stripJsonComments(rawConfig)),
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
    (it) => fsAdaptor.existsSync(it),
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

function findConfigFile(
  names: string[],
  searchPath: string,
  fileExists: (it: string) => boolean,
) {
  if (searchPath === "/") {
    return null
  }

  for (const name of names) {
    const fullPath = path.join(searchPath, name)
    if (fileExists(fullPath)) {
      logger.info(`found ${fullPath} in ${searchPath}`)
      return fullPath
    }
  }

  return findConfigFile(names, path.dirname(searchPath), fileExists)
}
