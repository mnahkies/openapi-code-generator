import {IROperation} from "../../core/openapi-types-normalized"
import {ImportBuilder} from "./import-builder"
import {TypeBuilder} from "./type-builder"
import {ClientOperationBuilder} from "./client-operation-builder"

export abstract class TypescriptClientBuilder {
  private readonly imports: ImportBuilder
  private readonly models: TypeBuilder
  private readonly operations: string[] = []

  constructor(
    public readonly filename: string,
    public readonly name: string,
    models: TypeBuilder,
  ) {
    this.imports = new ImportBuilder()
    this.models = models.withImports(this.imports)
    this.buildImports(this.imports)
  }

  add(operation: IROperation): void {
    const builder = new ClientOperationBuilder(operation, this.models)
    const result = this.buildOperation(builder)
    this.operations.push(result)
  }

  protected abstract buildImports(imports: ImportBuilder): void;

  protected abstract buildOperation(builder: ClientOperationBuilder): string;

  protected abstract buildClient(clientName: string, clientMethods: string[]): string;

  toString(): string {
    return `
    ${this.imports.toString()}

    ${this.buildClient(this.name, this.operations)}
    `
  }
}
