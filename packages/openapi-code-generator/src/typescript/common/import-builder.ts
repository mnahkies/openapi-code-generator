import path from "node:path"

export class ImportBuilder {
  private readonly imports: Record<string, Set<string>> = {}
  private readonly importAll: Record<string, string> = {}

  constructor(private readonly unit?: {filename: string}) {}

  from(from: string) {
    return {
      add: (...names: string[]): this => {
        for (const it of names) {
          this.addSingle(it, from)
        }
        return this
      },
      all: (name: string): this => {
        this.addModule(name, from)
        return this
      },
    }
  }

  addSingle(name: string, from: string): void {
    if (!name) {
      throw new Error(`cannot addSingle with name '${name}'`)
    }

    if (!from) {
      throw new Error(`cannot addSingle with from '${from}'`)
    }

    this.add(name, from, false)
  }

  addModule(name: string, from: string): void {
    if (!name) {
      throw new Error(`cannot addModule with name '${name}'`)
    }

    if (!from) {
      throw new Error(`cannot addModule with from '${from}'`)
    }

    this.add(name, from, true)
  }

  static merge(
    unit: {filename: string} | undefined,
    ...builders: ImportBuilder[]
  ): ImportBuilder {
    const result = new ImportBuilder(unit)

    // biome-ignore lint/complexity/noForEach: todo
    builders.forEach((builder) => {
      // biome-ignore lint/complexity/noForEach: todo
      Object.entries(builder.imports).forEach(([key, value]) => {
        // biome-ignore lint/suspicious/noAssignInExpressions: todo
        const imports = (result.imports[key] = result.imports[key] ?? new Set())

        for (const it of value) {
          imports.add(it)
        }
      })

      // biome-ignore lint/complexity/noForEach: todo
      Object.entries(builder.importAll).forEach(([key, value]) => {
        if (result.importAll[key] && result.importAll[key] !== value) {
          throw new Error("cannot merge imports with colliding importAlls")
        }

        result.importAll[key] = value
      })
    })

    return result
  }

  private add(name: string, from: string, isAll: boolean): void {
    // biome-ignore lint/style/noParameterAssign: normalization
    from = this.normalizeFrom(from)
    // biome-ignore lint/suspicious/noAssignInExpressions: init
    const imports = (this.imports[from] =
      this.imports[from] ?? new Set<string>())

    if (isAll) {
      this.importAll[from] = name
    } else {
      imports.add(name)
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
        // biome-ignore lint/style/noNonNullAssertion: todo
        const individualImports = Array.from(this.imports[from]!.values())
          .sort()
          .filter(hasImport)
          .join(", ")

        const importAll = this.importAll[from]

        const imports = [
          importAll && hasImport(importAll) ? importAll : "",
          individualImports.length > 0 ? `{${individualImports}}` : "",
        ]
          .filter(Boolean)
          .join(", ")

        return imports ? `import ${imports} from '${from}'` : ""
      })
      .filter(Boolean)
      .join("\n")
  }
}
