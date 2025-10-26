import {CompilationUnit, type ICompilable} from "../../common/compilation-units"
import type {ImportBuilder} from "../../common/import-builder"

export class AngularModuleBuilder implements ICompilable {
  private readonly ngImports = new Set<string>()
  private readonly ngDeclarations = new Set<string>()
  private readonly ngExports = new Set<string>()
  private readonly ngProviders = new Set<string>()

  constructor(
    readonly filename: string,
    public readonly exportName: string,
    private readonly tsImports: ImportBuilder,
  ) {
    this.tsImports.from("@angular/core").add("NgModule")
  }

  imports(from: string) {
    return this.imp(this.ngImports, from)
  }

  declarations(from: string) {
    return this.imp(this.ngDeclarations, from)
  }

  exports(from: string) {
    return this.imp(this.ngExports, from)
  }

  provides(from: string) {
    return this.imp(this.ngProviders, from)
  }

  private imp(collection: Set<string>, from: string) {
    return {
      add: (...names: string[]) => {
        this.tsImports.from(from).add(...names)

        for (const name of names) {
          collection.add(name)
        }
      },
    }
  }

  private sorted(collection: Set<string>): string[] {
    return Array.from(collection).sort()
  }

  toString(): string {
    return `
    @NgModule({
      imports: [
        ${this.sorted(this.ngImports).join(",\n")}
      ],
      declarations: [
        ${this.sorted(this.ngDeclarations).join(",\n")}
      ],
      exports: [
        ${this.sorted(this.ngExports).join(",\n")}
      ],
      providers: [
        ${this.sorted(this.ngProviders).join(",\n")}
      ],
    })
    export class ${this.exportName} {}

    export { ${this.exportName} as ApiModule }
    `
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.tsImports, this.toString())
  }
}
