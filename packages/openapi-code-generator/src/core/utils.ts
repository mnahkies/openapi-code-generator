/**
 * @prettier
 */

import _ from "lodash"

export function isDefined<T>(it: T | undefined): it is T {
  return it !== undefined
}

const httpMethods = new Set(["get", "put", "patch", "delete", "post"])

export function isHttpMethod(method: string): boolean {
  return httpMethods.has(method.toLowerCase())
}

export function deepEqual(x: unknown, y: unknown): boolean {
  return _.isEqual(x, y)
}

export function titleCase(str: string): string {
  const camel = _.camelCase(str)
  return _.capitalize(camel[0]) + camel.slice(1)
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

  return [type, subType].map(titleCase).join("")
}
