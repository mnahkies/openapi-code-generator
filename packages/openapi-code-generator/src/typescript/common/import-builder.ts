import path from "node:path"

export class ImportBuilder {
  private readonly imports: Record<string, Set<string>> = {}
  private readonly importAll: Record<string, string> = {}

  constructor(private readonly unit?: {filename: string}) {}

  from(from: string) {
    return {
      add: (...names: string[]): this => {
        names.forEach((it) => this.addSingle(it, from))
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

    return this.add(name, from, false)
  }

  addModule(name: string, from: string): void {
    if (!name) {
      throw new Error(`cannot addModule with name '${name}'`)
    }

    if (!from) {
      throw new Error(`cannot addModule with from '${from}'`)
    }

    return this.add(name, from, true)
  }

  static merge(
    unit: {filename: string} | undefined,
    ...builders: ImportBuilder[]
  ): ImportBuilder {
    const result = new ImportBuilder(unit)

    builders.forEach((builder) => {
      Object.entries(builder.imports).forEach(([key, value]) => {
        const imports = (result.imports[key] = result.imports[key] ?? new Set())
        value.forEach((it) => imports.add(it))
      })

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
    from = this.normalizeFrom(from)
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
      from = from.substring(0, from.length - ".ts".length)
    }

    if (this.unit && from.startsWith("./")) {
      const unitDirname = path.dirname(this.unit.filename)
      const fromDirname = path.dirname(from)

      const relative = path.relative(unitDirname, fromDirname)

      from = path.join(relative, path.basename(from))

      if (!from.startsWith("../") && !from.startsWith("./")) {
        from = "./" + from
      }
    }

    return from
  }

  toString(code: string = ""): string {
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
