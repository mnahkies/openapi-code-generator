import {IROperation} from "../../core/openapi-types-normalized"
import {ImportBuilder} from "./import-builder"
import {TypeBuilder} from "./type-builder"
import {ClientOperationBuilder} from "./client-operation-builder"
import {Input} from "../../core/input"
import {SchemaBuilder} from "./schema-builders/schema-builder"

export abstract class TypescriptClientBuilder {
  private readonly operations: string[] = []

  constructor(
    public readonly filename: string,
    public readonly name: string,
    protected readonly input: Input,
    protected readonly imports: ImportBuilder,
    protected readonly models: TypeBuilder,
    protected readonly schemaBuilder: SchemaBuilder,
    protected readonly enableRuntimeResponseValidation: boolean,
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
    return `
    ${this.imports.toString()}

    ${this.buildClient(this.name, this.operations)}
    `
  }
}
