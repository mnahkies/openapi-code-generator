import {Input} from "../../core/input"
import {IROperation} from "../../core/openapi-types-normalized"
import {ClientOperationBuilder} from "./client-operation-builder"
import {ImportBuilder} from "./import-builder"
import {SchemaBuilder} from "./schema-builders/schema-builder"
import {TypeBuilder} from "./type-builder"

export abstract class TypescriptClientBuilder {
  private readonly operations: string[] = []

  constructor(
    public readonly filename: string,
    public readonly name: string,
    protected readonly input: Input,
    protected readonly imports: ImportBuilder,
    protected readonly models: TypeBuilder,
    protected readonly schemaBuilder: SchemaBuilder,
    protected readonly config: {
      allowUnusedImports: boolean
      enableRuntimeResponseValidation: boolean
    } = {allowUnusedImports: false, enableRuntimeResponseValidation: false},
  ) {
    this.buildImports(imports)
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
    const code = this.buildClient(this.name, this.operations)

    return `
    ${this.imports.toString(this.config.allowUnusedImports ? "" : code)}

    ${code}
    `
  }
}
