/**
 * Simplified flattened schema structure, where compositions, nullability, etc, don't matter.
 *
 * We just need to know what is **possible**, as after initial parsing we'll validate against
 * the actual schema.
 */
export type PrimitiveType = {type: "string" | "number" | "boolean" | "null"}
export type ObjectSchema = {
  type: "object"
  properties: Record<string, SchemaStructure>
}
export type ArraySchema = {type: "array"; items: SchemaStructure}

export type SchemaStructure = PrimitiveType | ObjectSchema | ArraySchema

export type Style = "deepObject" | "form" | "pipeDelimited" | "spaceDelimited"

export interface Encoding {
  style: Style
  explode: boolean
}

export interface QueryParameter {
  name: string
  schema: SchemaStructure
  style?: Style
  explode?: boolean
  // allowEmptyValue: boolean
}

const separators = {
  deepObject: ",",
  form: ",",
  pipeDelimited: "|",
  spaceDelimited: " ",
} satisfies Record<Style, string>

export function parseCsvPairsToObject(str: string, sep: string) {
  const split = str.split(sep)
  const result: Record<string, unknown> = {}
  for (let i = 0; i < split.length; i += 2) {
    const key = split[i]
    // todo: json parse value?
    const value = split[i + 1]

    if (key) {
      result[key] = value
    }
  }
  return result
}

function escapeStringForRegExp(str: string): string {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d")
}

/**
 * Returns an ordered list of keys that match the provided key with array notation. E.g.,
 * For key "foo" return ["foo[0]", "foo[1]", "foo[2]", ...]
 */
export function extractArrayNotationKeys(
  key: string,
  keys: IteratorObject<string>,
): string[] {
  const regex = new RegExp(`^${escapeStringForRegExp(key)}\\[[0-9]+]$`)

  return Array.from(keys.filter((it) => regex.test(it))).sort()
}

function parseObjectQueryParameter(
  key: string,
  schema: ObjectSchema,
  encoding: Encoding,
  query: URLSearchParams,
): unknown | undefined {
  const type = schema.type

  if (encoding.explode) {
    if (encoding.style === "deepObject") {
      if (type === "object") {
        const result: Record<string, unknown> = {}

        for (const [subKey, subSchema] of Object.entries(schema.properties)) {
          if (subSchema.type === "object") {
            result[subKey] = parseObjectQueryParameter(
              `${key}[${subKey}]`,
              subSchema,
              encoding,
              query,
            )
          } else {
            // todo: parse nested objects?
            result[subKey] = query.get(`${key}[${subKey}]`) ?? undefined
          }
        }

        return result
      }

      throw new Error(
        `[expected to be unreachable] parseObjectQueryParameter: unsupported parameter type: ${type satisfies never} for explode: ${encoding.explode}, style: ${encoding.style}`,
      )
    } else {
      if (type === "object") {
        const result: Record<string, unknown> = {}

        for (const it of Object.keys(schema.properties)) {
          // todo: parse nested objects?
          result[it] = query.get(it) ?? undefined
        }

        return result
      }

      throw new Error(
        `[expected to be unreachable] parseObjectQueryParameter: unsupported parameter type: ${type satisfies never} for explode: ${encoding.explode}, style: ${encoding.style}`,
      )
    }
  } else {
    if (["form", "spaceDelimited", "pipeDelimited"].includes(encoding.style)) {
      const sep = separators[encoding.style]
      // todo: parse nested objects?
      return parseCsvPairsToObject(query.get(key) ?? "", sep)
    } else {
      return JSON.parse(query.get(key) ?? "null")
    }
  }
}

function parseArrayQueryParameter(
  key: string,
  _schema: ArraySchema,
  encoding: Encoding,
  query: URLSearchParams,
): unknown[] | undefined {
  if (encoding.explode) {
    if (encoding.style === "deepObject") {
      return (
        extractArrayNotationKeys(key, query.keys())
          // todo: handle nested objects/arrays based on items type?
          .map((it) => query.get(it) ?? undefined)
      )
    }

    return query.getAll(key)
  } else {
    return query.get(key)?.split(separators[encoding.style])
  }
}

function parsePrimitiveQueryParameter(key: string, query: URLSearchParams) {
  return query.get(key) ?? undefined
}

export function parseQueryParameter(
  {name, schema, explode, style}: QueryParameter,
  query: URLSearchParams,
): unknown {
  const encoding = {style: style ?? "form", explode: explode ?? true}
  const type = schema.type

  switch (type) {
    case "object":
      return parseObjectQueryParameter(name, schema, encoding, query)

    case "array":
      return parseArrayQueryParameter(name, schema, encoding, query)

    case "string":
    case "number":
    case "boolean":
    case "null":
      return parsePrimitiveQueryParameter(name, query)

    default: {
      throw new Error(`unsupported parameter type: ${type satisfies never}`)
    }
  }
}

export function parseQueryParameters(
  rawQuery: string,
  parameters: QueryParameter[],
): Record<string, unknown> {
  const query = new URLSearchParams(rawQuery)
  const result: Record<string, unknown> = {}

  for (const parameter of parameters) {
    result[parameter.name] = parseQueryParameter(parameter, query)
  }

  return result
}
