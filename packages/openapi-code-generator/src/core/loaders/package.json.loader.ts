import json5 from "json5"
import {z} from "zod/v4"
import type {IFsAdaptor} from "../file-system/fs-adaptor"
import {loadFileUp} from "./utils"

const schema = z.object({
  type: z.enum(["module", "commonjs"]).optional().default("commonjs"),
})

export async function loadPackageJson(
  outputPath: string,
  fsAdaptor: IFsAdaptor,
) {
  const packageJson = json5.parse(
    (await loadFileUp("package.json", outputPath, fsAdaptor)) ?? "{}",
  )

  return schema.parse(packageJson)
}
