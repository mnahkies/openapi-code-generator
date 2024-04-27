import {promptContinue} from "../cli-utils"
import {logger} from "../logger"
import {isRemote} from "./utils"

export async function compileTypeSpecToOpenAPI3(path: string): Promise<object> {
  const {compile, NodeHost} = await import("@typespec/compiler")
  const {getOpenAPI3} = await import("@typespec/openapi3")

  // TODO: anyway we can compile raw text instead of passing a file path?
  //       could unlock compilation from url
  if (isRemote(path)) {
    throw new Error("reading typespec input from uri is not yet supported")
  }

  const program = await compile(NodeHost, path)

  const missingImports = program.diagnostics
    .filter((it) => it.code === "import-not-found" || it.code === "file-load")
    .reduce((acc, it) => {
      acc.add(it.message)
      return acc
    }, new Set<string>())

  if (missingImports.size > 0) {
    Array.from(missingImports).forEach((it) => logger.error(it))
    throw new Error("missing imports")
  } else {
    program.diagnostics.forEach((it) => {
      switch (it.severity) {
        case "error":
          logger.error(it.message)
          break
        case "warning":
          logger.warn(it.message)
          break
      }
    })

    if (program.diagnostics.length > 0) {
      await promptContinue(
        `Found diagnostic messages from the typespec compiler for '${path}', continue?`,
        "yes",
      )
    }
  }

  const serviceRecords = await getOpenAPI3(program, {
    "safeint-strategy": "int64",
  })

  // TODO: support multiple services?
  if (serviceRecords.length > 1) {
    throw new Error("only a single service record is supported")
  }

  const serviceRecord = serviceRecords[0]

  if (!serviceRecord) {
    throw new Error("no service record returned")
  }

  if (!serviceRecord.versioned) {
    return serviceRecord.document
  } else {
    // TODO: support multiple versions?
    const newestVersion = serviceRecord.versions.at(-1)

    if (!newestVersion) {
      throw new Error("no versions returned")
    }

    return newestVersion.document
  }
}
