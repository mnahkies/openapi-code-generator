import type {Input} from "../../core/input"
import type {IROperation} from "../../core/openapi-types-normalized"
import {CompilationUnit, type ICompilable} from "../common/compilation-units"
import type {ImportBuilder} from "../common/import-builder"
import type {SchemaBuilder} from "../common/schema-builders/schema-builder"
import type {TypeBuilder} from "../common/type-builder"
import {
  ServerOperationBuilder,
  type ServerSymbols,
} from "./server-operation-builder"

export abstract class AbstractRouterBuilder implements ICompilable {
  protected readonly capabilities = {
    requestBody: {
      mediaTypes: [
        "application/json",
        "application/scim+json",
        "application/merge-patch+json",
        "application/x-www-form-urlencoded",
        "application/octet-stream",
        "text/json",
        "text/plain",
        "text/x-markdown",
      ],
    },
  }

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
      {
        requestBody: {
          supportedMediaTypes: this.capabilities.requestBody.mediaTypes,
        },
      },
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

  protected abstract operationSymbols(operationId: string): ServerSymbols

  protected parseRequestInput(
    propertyName: string,
    opts: {
      name: string | undefined
      schema: string | undefined
      source: string
      type: string
      comment?: string
    },
  ) {
    if (!opts.name || !opts.schema) {
      return `${opts.comment ? `${opts.comment}\n` : ""}${propertyName}: undefined`
    }

    return `${opts.comment ? `${opts.comment}\n` : ""}${propertyName}: parseRequestInput(${opts.name}, ${opts.source}, ${opts.type})`
  }

  toString(): string {
    return this.buildRouter(this.name, this.statements)
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
