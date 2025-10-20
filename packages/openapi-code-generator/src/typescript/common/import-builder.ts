import path from "node:path"

export function naturalCompare(a: string, b: string): number {
  // Primary: case-insensitive, numeric-aware comparison
  const base = a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "base",
  })
  if (base !== 0) {
    // If they differ, check earliest position of difference. If that position only
    // differs by case (same letter ignoring case), prefer the uppercase at that position.
    const len = Math.min(a.length, b.length)

    for (let i = 0; i < len; i++) {
      // biome-ignore lint/style/noNonNullAssertion: magic
      const ca = a[i]!
      // biome-ignore lint/style/noNonNullAssertion: magic
      const cb = b[i]!

      if (ca === cb) {
        continue
      }

      if (ca.toLowerCase() === cb.toLowerCase()) {
        const aUpper = ca >= "A" && ca <= "Z"
        const bUpper = cb >= "A" && cb <= "Z"

        if (aUpper !== bUpper) {
          return aUpper ? -1 : 1
        }
      }

      // first differing char is different ignoring case — honor base comparison
      break
    }

    return base
  }

  // Tie-breaker: case-sensitive compare to ensure A < a < B < b
  return a < b ? -1 : a > b ? 1 : 0
}

enum ImportCategory {
  URL = 0,
  PROTOCOL = 1,
  PACKAGE = 2,
  ALIAS = 3,
  PATH = 4,
}

export function categorizeImportSource(source: string): ImportCategory {
  const isUrl = source.startsWith("http://") || source.startsWith("https://")

  if (isUrl) {
    return ImportCategory.URL
  }

  if (/^[a-z]+:/.test(source)) {
    return ImportCategory.PROTOCOL
  }

  const isAlias =
    source.startsWith("#") ||
    source.startsWith("@/") ||
    source.startsWith("~") ||
    source.startsWith("$") ||
    source.startsWith("%")

  const isPath =
    source.startsWith("./") ||
    source.startsWith("../") ||
    source.startsWith("/")

  if (!isAlias && !isPath) {
    return ImportCategory.PACKAGE
  }
  if (isAlias) {
    return ImportCategory.ALIAS
  }

  return ImportCategory.PATH
}

export class ImportBuilder {
  private readonly imports: Record<
    string,
    {values: Set<string>; types: Set<string>}
  > = {}
  private readonly importAll: Record<string, string> = {}

  constructor(private readonly unit?: {filename: string}) {}

  from(from: string) {
    const chain = {
      add: (...names: string[]) => {
        for (const it of names) {
          this.addSingle(it, from, false)
        }
        return chain
      },
      addType: (...names: string[]) => {
        for (const it of names) {
          this.addSingle(it, from, true)
        }
        return chain
      },
      all: (name: string) => {
        this.addModule(name, from)
        return chain
      },
    }
    return chain
  }

  addSingle(name: string, from: string, isType: boolean): void {
    if (!name) {
      throw new Error(`cannot addSingle with name '${name}'`)
    }

    if (!from) {
      throw new Error(`cannot addSingle with from '${from}'`)
    }

    this.add(name, from, false, isType)
  }

  addModule(name: string, from: string): void {
    if (!name) {
      throw new Error(`cannot addModule with name '${name}'`)
    }

    if (!from) {
      throw new Error(`cannot addModule with from '${from}'`)
    }

    // todo: add support for importing whole module as a type
    this.add(name, from, true, false)
  }

  static merge(
    unit: {filename: string} | undefined,
    ...builders: ImportBuilder[]
  ): ImportBuilder {
    const result = new ImportBuilder(unit)

    for (const builder of builders) {
      for (const [key, {values, types}] of Object.entries(builder.imports)) {
        if (!result.imports[key]) {
          result.imports[key] = {
            values: new Set(),
            types: new Set(),
          }
        }

        const imports = result.imports[key]

        for (const it of values) {
          imports.values.add(it)
        }
        for (const it of types) {
          imports.types.add(it)
        }
      }

      for (const [key, value] of Object.entries(builder.importAll)) {
        if (result.importAll[key] && result.importAll[key] !== value) {
          throw new Error("cannot merge imports with colliding importAlls")
        }

        result.importAll[key] = value
      }
    }

    return result
  }

  private add(
    name: string,
    from: string,
    isAll: boolean,
    isType: boolean,
  ): void {
    // biome-ignore lint/style/noParameterAssign: normalization
    from = this.normalizeFrom(from)

    if (!this.imports[from]) {
      this.imports[from] = {
        values: new Set(),
        types: new Set(),
      }
    }

    let imports = this.imports[from]

    if (!imports) {
      imports = {
        values: new Set(),
        types: new Set(),
      }
      this.imports[from] = imports
    }

    if (isAll) {
      this.importAll[from] = name
    } else {
      if (isType) {
        imports.types.add(name)
      } else {
        imports.values.add(name)
      }
    }
  }

  private normalizeFrom(from: string) {
    if (from.endsWith(".ts")) {
      // TODO: toggle based on project settings
      // biome-ignore lint/style/noParameterAssign: normalization
      // from = from.substring(0, from.length - ".ts".length)
    }

    if (this.unit && from.startsWith("./")) {
      const unitDirname = path.dirname(this.unit.filename)
      const fromDirname = path.dirname(from)

      const relative = path.relative(unitDirname, fromDirname)

      // biome-ignore lint/style/noParameterAssign: normalization
      from = path.join(relative, path.basename(from))

      if (!from.startsWith("../") && !from.startsWith("./")) {
        // biome-ignore lint/style/noParameterAssign: normalization
        from = `./${from}`
      }
    }

    return from
  }

  toString(code = ""): string {
    // HACK: eliminate unused imports by crudely tokenizing the code
    //       and checking for instances of each import.
    //       it would be better to track usages properly during generation
    const tokens = new Set(
      code
        .split(/(?![."'])\W/)
        .filter(Boolean)
        .reduce((acc, it) => {
          const [first] = it.split(".")
          if (first) {
            acc.push(first)
          }
          return acc
        }, [] as string[]),
    )
    const hasImport = (it: string) => !code || tokens.has(it)

    return Array.from(
      new Set([
        ...Object.keys(this.imports),
        ...Object.keys(this.importAll),
      ]).values(),
    )
      .sort((a, b) => {
        const categoryA = categorizeImportSource(a)
        const categoryB = categorizeImportSource(b)

        if (categoryA !== categoryB) {
          return categoryA - categoryB
        }

        return naturalCompare(a, b)
      })
      .map((from) => {
        const valueImports = Array.from(
          (this.imports[from]?.values ?? new Set()).values(),
        )
        const typeImports = Array.from(
          (this.imports[from]?.types ?? new Set()).values(),
        ).filter((it) => !valueImports.includes(it))

        const combinedImports = [
          ...valueImports.map((it) => ({name: it, isType: false})),
          ...typeImports.map((it) => ({name: it, isType: true})),
        ]

        const importAll = this.importAll[from]
        const hasImportAll = importAll && hasImport(importAll)

        const isAllTypeImports =
          combinedImports.every((it) => it.isType) && !hasImportAll

        const individualImports = combinedImports
          .sort((a, b) => naturalCompare(a.name, b.name))
          .filter((it) => hasImport(it.name))
          .map((it) =>
            it.isType && !isAllTypeImports ? `type ${it.name}` : it.name,
          )
          .join(", ")

        const imports = [
          hasImportAll ? importAll : "",
          individualImports.length > 0
            ? `${isAllTypeImports ? "type " : ""}{${individualImports}}`
            : "",
        ]
          .filter(Boolean)
          .join(", ")

        return imports ? `import ${imports} from '${from}'` : ""
      })
      .filter(Boolean)
      .join("\n")
  }
}
