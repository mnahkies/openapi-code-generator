import json5 from "json5"
import {z} from "zod/v4"
import type {IFsAdaptor} from "../file-system/fs-adaptor.ts"
import {logger} from "../logger.ts"
import {loadFileUp} from "./utils.ts"

const schema = z.object({
  name: z.string().optional(),
  type: z.enum(["module", "commonjs"]).optional().default("commonjs"),
})

export async function loadPackageJson(
  outputPath: string,
  fsAdaptor: IFsAdaptor,
) {
  let rawJson = await loadFileUp("package.json", outputPath, fsAdaptor)

  if (!rawJson) {
    logger.warn("no package.json found, using defaults")
    rawJson = "{}"
  }

  const packageJson = json5.parse(rawJson)

  return schema.parse(packageJson)
}
