import _ from "lodash"

export function isDefined<T>(it: T | undefined): it is T {
  return it !== undefined
}

const httpMethods = new Set([
  "get",
  "put",
  "patch",
  "delete",
  "post",
])

export function isHttpMethod(method: string): boolean {
  return httpMethods.has(method.toLowerCase())
}

export function titleCase(str: string): string {
  const camel = _.camelCase(str)
  return _.capitalize(camel[0]) + camel.slice(1)
}
