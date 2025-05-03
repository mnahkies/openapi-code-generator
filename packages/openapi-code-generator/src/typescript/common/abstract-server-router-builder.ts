import type {Input} from "../../core/input"
import type {IROperation} from "../../core/openapi-types-normalized"
import {CompilationUnit, type ICompilable} from "./compilation-units"
import type {ImportBuilder} from "./import-builder"
import type {SchemaBuilder} from "./schema-builders/schema-builder"
import {ServerOperationBuilder} from "./server-operation-builder"
import type {TypeBuilder} from "./type-builder"

export abstract class AbstractServerRouterBuilder implements ICompilable {
  private readonly statements: string[] = []

  protected constructor(
    public readonly filename: string,
    public readonly name: string,
    protected readonly input: Input,
    protected readonly imports: ImportBuilder,
    protected readonly types: TypeBuilder,
    protected readonly schemaBuilder: SchemaBuilder,
  ) {
    this.buildImports()
  }

  add(operation: IROperation): void {
    const builder = new ServerOperationBuilder(
      operation,
      this.input,
      this.types,
      this.schemaBuilder,
    )
    const result = this.buildOperation(builder)
    this.statements.push(result)
  }

  protected abstract buildImports(): void

  protected abstract buildOperation(builder: ServerOperationBuilder): string

  protected abstract buildRouter(
    routerName: string,
    statements: string[],
  ): string

  toString(): string {
    return this.buildRouter(this.name, this.statements)
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
