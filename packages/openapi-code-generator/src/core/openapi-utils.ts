import { Reference } from "./openapi-types"

export function isRef(it: any | Reference): it is Reference {
  if (!it || typeof it !== "object") {
    return false
  }
  return Reflect.has(it, '$ref')
}

export function getNameFromRef({ $ref }: Reference): string {
  const name = $ref.split('/').pop()

  if (!name) {
    throw new Error(`no name found in $ref: '${ $ref }'`)
  }

  // TODO: this is a hack to workaround reserved words being used as names
  //       can likely improve to selectively apply when a reserved word is used.
  return 't_' + name.replace(/-/g, '_')
}
