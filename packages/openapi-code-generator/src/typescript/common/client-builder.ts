import type {Input} from "../../core/input"
import type {IROperation} from "../../core/openapi-types-normalized"
import {ClientOperationBuilder} from "./client-operation-builder"
import {ClientServersBuilder} from "./client-servers-builder"
import {CompilationUnit, type ICompilable} from "./compilation-units"
import type {ImportBuilder} from "./import-builder"
import type {SchemaBuilder} from "./schema-builders/schema-builder"
import type {TypeBuilder} from "./type-builder"
import {quotedStringLiteral, union} from "./type-utils"

export abstract class TypescriptClientBuilder implements ICompilable {
  private readonly operations: string[] = []

  protected readonly clientServersBuilder: ClientServersBuilder

  constructor(
    public readonly filename: string,
    public readonly exportName: string,
    protected readonly input: Input,
    protected readonly imports: ImportBuilder,
    protected readonly models: TypeBuilder,
    protected readonly schemaBuilder: SchemaBuilder,
    protected readonly config: {
      enableRuntimeResponseValidation: boolean
      enableTypedBasePaths: boolean
    } = {enableRuntimeResponseValidation: false, enableTypedBasePaths: true},
  ) {
    this.buildImports(imports)

    this.clientServersBuilder = new ClientServersBuilder(
      this.filename,
      this.exportName,
      this.input.servers(),
      this.imports,
    )
  }

  basePathType() {
    if (
      this.config.enableTypedBasePaths &&
      this.clientServersBuilder.hasServers
    ) {
      return this.clientServersBuilder.typeExportName
    }

    return ""
  }

  add(operation: IROperation): void {
    const builder = new ClientOperationBuilder(
      operation,
      this.models,
      this.schemaBuilder,
    )
    const result = this.buildOperation(builder)
    this.operations.push(result)
    this.clientServersBuilder.addOperation(operation)
  }

  protected abstract buildImports(imports: ImportBuilder): void

  protected abstract buildOperation(builder: ClientOperationBuilder): string

  protected abstract buildClient(
    clientName: string,
    clientMethods: string[],
  ): string

  toString(): string {
    const client = this.buildClient(this.exportName, this.operations)

    return `
    ${this.clientServersBuilder}
    ${client}
    `
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
