function wrapForArrayOrRestParameters<T, U>(fn: (arg: T[]) => U): {
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
      .filter(it => seen.has(it) ? false : seen.add(it) && true)
  )
}

type MaybeString = string | undefined | null

export const union = wrapForArrayOrRestParameters(function (types: MaybeString[]): string {
  const distinctTypes = unique(types)

  if (!distinctTypes.length) {
    return ""
  } else if (distinctTypes.length === 1) {
    return distinctTypes[0]
  }

  return `(${distinctTypes.join("\n | ")})`
})

export const intersect = wrapForArrayOrRestParameters(function (types: MaybeString[]): string {
  const distinctTypes = unique(types)

  if (!distinctTypes.length) {
    return ""
  } else if (distinctTypes.length === 1) {
    return distinctTypes[0]
  }

  return `(${distinctTypes.join(" & ")})`
})

export const objectProperty = ({name, type, isReadonly, isRequired}: {
  name: string,
  type: string,
  isReadonly: boolean,
  isRequired: boolean
}) => {
  return [
    isReadonly ? "readonly" : "",
    `"${name}"` + (isRequired ? ":" : "?:"),
    type,
  ].filter(Boolean).join(" ") + ""
}
