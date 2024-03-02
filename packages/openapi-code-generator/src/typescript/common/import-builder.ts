export class ImportBuilder {
  private readonly imports: Record<string, Set<string>> = {}
  private readonly importAll: Record<string, string> = {}

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
    return this.add(name, from, false)
  }

  addModule(name: string, from: string): void {
    return this.add(name, from, true)
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
      return from.substr(0, from.length - ".ts".length)
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
