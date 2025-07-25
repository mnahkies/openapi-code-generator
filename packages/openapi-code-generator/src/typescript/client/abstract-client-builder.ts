import type {Input} from "../../core/input"
import type {IROperation} from "../../core/openapi-types-normalized"
import {CompilationUnit, type ICompilable} from "../common/compilation-units"
import type {ImportBuilder} from "../common/import-builder"
import type {SchemaBuilder} from "../common/schema-builders/schema-builder"
import type {TypeBuilder} from "../common/type-builder"
import {union} from "../common/type-utils"
import {ClientOperationBuilder} from "./client-operation-builder"
import {ClientServersBuilder} from "./client-servers-builder"

export type ClientBuilderCapabilities = {
  requestBody: {mediaTypes: string[]}
}

export abstract class AbstractClientBuilder implements ICompilable {
  protected abstract readonly capabilities: ClientBuilderCapabilities

  private readonly operations: string[] = []

  protected readonly clientServersBuilder: ClientServersBuilder

  constructor(
    public readonly filename: string,
    public readonly exportName: string,
    protected readonly input: Input,
    protected readonly imports: ImportBuilder,
    protected readonly types: TypeBuilder,
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
      {enableTypedBasePaths: config.enableTypedBasePaths},
    )
  }

  basePathType() {
    return union(this.clientServersBuilder.typeForDefault(), "string")
  }

  add(operation: IROperation): void {
    const builder = new ClientOperationBuilder(
      operation,
      this.types,
      this.schemaBuilder,
      this.input,
      {
        requestBody: {
          supportedMediaTypes: this.capabilities.requestBody.mediaTypes,
        },
      },
    )
    this.clientServersBuilder.addOperation(operation)
    const result = this.buildOperation(builder)
    this.operations.push(result)
  }

  protected legacyExports(clientName: string, isConfigAClass = false) {
    if (clientName === "ApiClient") {
      return ""
    }

    return `
export { ${clientName} as ApiClient }
export ${isConfigAClass ? "" : "type"} { ${clientName}Config as ApiClientConfig }
    `
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
