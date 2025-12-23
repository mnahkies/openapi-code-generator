import type {IncomingMessage} from "node:http"
import getRawBody from "raw-body"

export type SizeLimit = number | `${number}${"b" | "kb" | "mb" | "gb"}`

export async function parseOctetStreamRequestBody(
  req: IncomingMessage,
  opts: {
    contentLength?: number | undefined
    sizeLimit: SizeLimit | undefined
  },
) {
  const contentLength =
    opts.contentLength ??
    (req.headers["content-length"]
      ? parseInt(req.headers["content-length"], 10)
      : undefined)

  if (!contentLength) {
    throw new Error("No content length provided")
  }

  const body = await getRawBody(req, {
    length: contentLength,
    limit: opts.sizeLimit ?? "1mb",
  })

  if (!body) {
    return undefined
  }

  if (!Buffer.isBuffer(body)) {
    throw new Error("body must be a buffer")
  }

  const blob = new Blob([new Uint8Array(body)], {
    type: "application/octet-stream",
  })

  return blob
}
