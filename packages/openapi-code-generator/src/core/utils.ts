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
