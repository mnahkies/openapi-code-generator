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

  toString(): string {
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
          .join(", ")

        return `import ${[
          this.importAll[from] ?? "",
          individualImports.length > 0 ? `{${individualImports}}` : "",
        ]
          .filter((it) => it.length)
          .join(", ")} from '${from}'`
      })
      .join("\n")
  }
}
