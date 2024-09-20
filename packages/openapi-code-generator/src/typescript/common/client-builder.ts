import type {Input} from "../../core/input"
import type {IROperation} from "../../core/openapi-types-normalized"
import {ClientOperationBuilder} from "./client-operation-builder"
import {CompilationUnit, type ICompilable} from "./compilation-units"
import type {ImportBuilder} from "./import-builder"
import type {SchemaBuilder} from "./schema-builders/schema-builder"
import type {TypeBuilder} from "./type-builder"
import {quotedStringLiteral, union} from "./type-utils"

export abstract class TypescriptClientBuilder implements ICompilable {
  private readonly operations: string[] = []

  constructor(
    public readonly filename: string,
    public readonly name: string,
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
  }

  basePathType() {
    const serverUrls = this.input
      .servers()
      .map((it) => quotedStringLiteral(it.url))

    if (this.config.enableTypedBasePaths && serverUrls.length > 0) {
      return union(...serverUrls, "string")
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
  }

  protected abstract buildImports(imports: ImportBuilder): void

  protected abstract buildOperation(builder: ClientOperationBuilder): string

  protected abstract buildClient(
    clientName: string,
    clientMethods: string[],
  ): string

  toString(): string {
    return this.buildClient(this.name, this.operations)
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
