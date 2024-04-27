export async function compileTypeSpecToOpenAPI3(path: string): Promise<object> {
  const {compile, NodeHost} = await import("@typespec/compiler")
  const {getOpenAPI3} = await import("@typespec/openapi3")

  const program = await compile(NodeHost, path)

  const serviceRecords = await getOpenAPI3(program)

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
    throw new Error("versioned not not supported")
  }
}
