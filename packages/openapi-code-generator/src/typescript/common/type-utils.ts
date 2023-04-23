/**
 * @prettier
 */

function wrap<T, U>(
  fn: (arg: T[]) => U
): {
  (...arg: T[] | T[][]): U
} {
  return (...args: T[] | T[][]) => {
    if ((args as unknown[]).every((it) => Array.isArray(it))) {
      return fn((args as T[][]).reduce((acc, it) => acc.concat(it), [] as T[]))
    }
    return fn(args as T[])
  }
}

function unique(types: (string | undefined | null)[]) {
  const seen = new Set<string>()

  return Array.from(
    types
      .filter((it): it is string => Boolean(it))
      .filter((it) => (seen.has(it) ? false : seen.add(it) && true))
  )
}

type MaybeString = string | undefined | null

export const union = wrap((types: MaybeString[]): string => {
  const distinctTypes = unique(types)

  if (!distinctTypes.length) {
    return ""
  } else if (distinctTypes.length === 1) {
    return distinctTypes[0]
  }

  return `(${distinctTypes.join("\n | ")})`
})

export const intersect = wrap((types: MaybeString[]): string => {
  const distinctTypes = unique(types)

  if (!distinctTypes.length) {
    return ""
  } else if (distinctTypes.length === 1) {
    return distinctTypes[0]
  }

  return `(${distinctTypes.join(" & ")})`
})

export type ObjectPropertyDefinition = {
  name: string
  type: string
  isReadonly: boolean
  isRequired: boolean
}

export const objectProperty = ({
  name,
  type,
  isReadonly,
  isRequired,
}: ObjectPropertyDefinition): string => {
  return [
    isReadonly ? "readonly" : "",
    `"${name}"` + (isRequired ? ":" : "?:"),
    type,
  ]
    .filter(Boolean)
    .join(" ")
}

export const object = wrap((properties: MaybeString[]): string => {
  const definedProperties = properties.filter(Boolean)

  if (!definedProperties.length) {
    return ""
  }

  return "{\n" + definedProperties.join("\n") + "\n}"
})
export const array = (type: string): string => `(${type})[]`

export const toString = (it: string | number): string => it.toString()

export const quotedValue = (it: string): string => `"${it}"`
