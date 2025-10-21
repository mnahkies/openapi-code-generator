import path from "node:path"

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
      // biome-ignore lint/style/noParameterAssign: normalization
      from = from.substring(0, from.length - ".ts".length)
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
      .sort()
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
          .sort((a, b) => (a.name < b.name ? -1 : 1))
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
