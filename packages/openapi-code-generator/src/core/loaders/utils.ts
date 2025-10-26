import path from "node:path"
import type {IFsAdaptor} from "../file-system/fs-adaptor"

export function isRemote(location: string): boolean {
  return location.startsWith("http://") || location.startsWith("https://")
}

export async function loadFileUp(
  filename: string,
  directory: string,
  fsAdaptor: IFsAdaptor,
): Promise<string | undefined> {
  while (directory !== "/") {
    const filePath = path.join(directory, filename)

    if (await fsAdaptor.exists(filePath)) {
      return fsAdaptor.readFile(filePath)
    }

    // biome-ignore lint/style/noParameterAssign: walk
    directory = path.dirname(directory)
  }

  return undefined
}
