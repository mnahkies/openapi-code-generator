import path from "node:path"
import _ from "lodash"

export function isDefined<T>(it: T | undefined): it is T {
  return it !== undefined
}

export function isTruthy<T>(it: T | undefined | null | "" | 0): it is T {
  return Boolean(it)
}

export function hasSingleElement<T>(it: T[]): it is [T] {
  return it.length === 1
}

export function coalesce<T>(...args: (T | undefined | null)[]): T {
  const result = args.find((it) => it !== undefined && it !== null)

  if (result === undefined) {
    throw new Error("all arguments are null or undefined")
  }

  return result
}

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD"
// | "TRACE"

export const httpMethods = new Set<HttpMethod>([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
  // note: trace doesn't seem to be supported by koa router
  // "TRACE",
])

export function isHttpMethod(method: string): method is HttpMethod {
  return httpMethods.has(method.toUpperCase() as HttpMethod)
}

export function deepEqual(x: unknown, y: unknown): boolean {
  return _.isEqual(x, y)
}

export function titleCase(str: string): string {
  return identifier(str, "title-case")
}

export function camelCase(str: string): string {
  return identifier(str, "camel-case")
}

export function snakeCase(str: string): string {
  return identifier(str, "snake-case")
}

export function kebabCase(str: string): string {
  return identifier(str, "kebab-case")
}

export function upperFirst(str: string): string {
  return _.upperFirst(str)
}

export function lowerFirst(str: string): string {
  return _.lowerFirst(str)
}

// TODO: typescript/javascript reserved words probably don't belong in core
const reservedWords: Set<string> = new Set([
  // JavaScript keywords
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",

  /*
  // TODO: identifiers like `package` currently get emitted in integration tests
  // Future reserved words
  "enum",
  "implements",
  "interface",
  "package",
  "private",
  "protected",
  "public",
*/

  // Additional reserved words in strict mode
  "let",
  "static",

  // Global objects
  "Infinity",
  "NaN",
  "undefined",
  "null",
  "true",
  "false",

  // Reserved literals
  "await",
  "async",
])

export type IdentifierConvention =
  | "camel-case"
  | "title-case"
  | "kebab-case"
  | "snake-case"

export function identifier(str: string, convention: IdentifierConvention) {
  const withoutLeadingDigits = str.replace(/^[0-9]+/g, "")
  const withoutSpecial = withoutLeadingDigits.replace(/[^a-zA-Z0-9_$]/g, " ")

  const transformed = (() => {
    switch (convention) {
      case "camel-case":
        return _.camelCase(withoutSpecial)
      case "title-case": {
        const camel = _.camelCase(withoutSpecial)
        return _.upperFirst(camel)
      }
      case "kebab-case":
        return _.kebabCase(withoutSpecial)
      case "snake-case":
        return _.snakeCase(withoutSpecial)
    }
  })()

  if (reservedWords.has(transformed)) {
    throw new TypeError(
      `'${str}' transforms to identifier '${transformed}' in ${convention}, which is a reserved word`,
    )
  }

  return transformed
}

export function normalizeFilename(
  str: string,
  convention: IdentifierConvention,
) {
  const directory = path.dirname(str)
  const ext = path.extname(str)
  const filename = path.basename(str, ext)

  const result = path.join(
    directory,
    `${identifier(filename, convention)}${ext}`,
  )
  return str.startsWith("./") ? `./${result}` : result
}

export function mediaTypeToIdentifier(mediaType: string): string {
  const [type, subType] = mediaType.split("/").map((it) => {
    return _.camelCase(it.replaceAll(/[-.+]/g, " "))
  })

  if (subType === "json") {
    return "Json"
  }

  if (subType === "xml") {
    return "Xml"
  }

  if (type === "text" && subType === "plain") {
    return "Text"
  }

  return titleCase([type, subType].filter(isDefined).join(" "))
}
