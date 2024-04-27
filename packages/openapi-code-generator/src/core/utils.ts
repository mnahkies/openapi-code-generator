import _ from "lodash"

export function isDefined<T>(it: T | undefined): it is T {
  return it !== undefined
}

export function hasSingleElement<T>(it: T[]): it is [T] {
  return it.length === 1
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS"

export const httpMethods = new Set<HttpMethod>([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
])

export function isHttpMethod(method: string): method is HttpMethod {
  return httpMethods.has(method.toUpperCase() as HttpMethod)
}

export function deepEqual(x: unknown, y: unknown): boolean {
  return _.isEqual(x, y)
}

export function titleCase(str: string): string {
  const camel = camelCase(str)
  return _.capitalize(camel[0]) + camel.slice(1)
}

export function camelCase(str: string): string {
  return _.camelCase(str)
}

export function upperFirst(str: string): string {
  return _.upperFirst(str)
}

export function mediaTypeToIdentifier(mediaType: string): string {
  const [type, subType] = mediaType.split("/").map((it) => {
    return camelCase(it.replaceAll(/[-.+]/g, " "))
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

  return [type, subType].filter(isDefined).map(titleCase).join("")
}
