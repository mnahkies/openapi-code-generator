import {Reference} from "./openapi-types"

export function isRef(it: unknown | Reference): it is Reference {
  if (!it || typeof it !== "object") {
    return false
  }
  return Reflect.has(it, "$ref")
}

export function getNameFromRef({$ref}: Reference, prefix: string): string {
  const name = $ref.split("/").pop()

  if (!name) {
    throw new Error(`no name found in $ref: '${$ref}'`)
  }

  // todo: this is a hack to workaround reserved words being used as names
  //       can likely improve to selectively apply when a reserved word is used.
  return prefix + name.replace(/[-.]+/g, "_")
}

export function getTypeNameFromRef(reference: Reference) {
  return getNameFromRef(reference, "t_")
}

export function getSchemaNameFromRef(reference: Reference) {
  return getNameFromRef(reference, "s_")
}
