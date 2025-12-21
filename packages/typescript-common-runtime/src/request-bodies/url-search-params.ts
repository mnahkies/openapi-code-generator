export type Style = "deepObject" | "form" | "pipeDelimited" | "spaceDelimited"

export interface Encoding {
  // allowReserved?: boolean;
  // contentType?: string;
  explode?: boolean
  style?: Style
}

function getEncoding(key: string, encoding: Record<string, Encoding>) {
  const defaultEncoding = {
    style: "form" as Style,
    explode: true,
    allowReserved: false,
  }

  return {...defaultEncoding, ...encoding[key]}
}

const separators = {
  deepObject: ",",
  form: ",",
  pipeDelimited: "|",
  spaceDelimited: " ",
} satisfies Record<Style, string>

function addArrayValue(
  result: URLSearchParams,
  key: string,
  value: unknown[],
  encoding: Required<Encoding>,
) {
  if (encoding.style === "deepObject" && encoding.explode) {
    return addObjectValue(result, key, value, encoding)
  }

  if (encoding.explode) {
    for (const it of value) {
      result.append(key, String(it))
    }
  } else {
    result.append(key, value.join(separators[encoding.style]))
  }
}

function addObjectValue(
  result: URLSearchParams,
  key: string,
  value: object,
  encoding: Required<Encoding>,
) {
  if (encoding.explode) {
    if (encoding.style === "deepObject") {
      for (const it of Object.entries(value)) {
        const path = `${key}[${it[0]}]`
        const value = it[1]

        if (typeof value === "object") {
          addObjectValue(result, path, value, encoding)
        } else {
          result.append(path, String(value))
        }
      }
    } else {
      for (const it of Object.entries(value)) {
        result.append(it[0], String(it[1]))
      }
    }
  } else {
    if (["form", "spaceDelimited", "pipeDelimited"].includes(encoding.style)) {
      const sep = separators[encoding.style]
      result.append(
        key,
        Object.entries(value)
          .map((entry) =>
            [
              entry[0],
              typeof entry[1] === "object"
                ? JSON.stringify(entry[1])
                : entry[1],
            ].join(sep),
          )
          .join(sep),
      )
    } else {
      result.append(key, JSON.stringify(value))
    }
  }
}

/**
 * Serializes a request body as `application/x-www-form-urlencoded` with the exact
 * semantics defined by the provided encodings, falling back to the default encoding
 * specified by the OAI specification.
 */
export function requestBodyToUrlSearchParams(
  obj: Record<string, unknown>,
  encodings: Record<string, Encoding> = {},
): URLSearchParams {
  const result = new URLSearchParams()

  for (const [key, value] of Object.entries(obj)) {
    const encoding = getEncoding(key, encodings)

    if (value === undefined || value === null) {
      // RFC 1866 8.2.1: "Fields with null values may be omitted."
      continue
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        addArrayValue(result, key, value, encoding)
      } else {
        addObjectValue(result, key, value, encoding)
      }
    } else {
      result.append(key, String(value))
    }
  }

  return result
}
