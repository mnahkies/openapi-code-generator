import type {Input} from "../../core/input"
import type {
  IROperation,
  IRServer,
  IRServerVariable,
} from "../../core/openapi-types-normalized"
import {ClientOperationBuilder} from "./client-operation-builder"
import {CompilationUnit, type ICompilable} from "./compilation-units"
import type {ImportBuilder} from "./import-builder"
import type {SchemaBuilder} from "./schema-builders/schema-builder"
import type {TypeBuilder} from "./type-builder"
import {quotedStringLiteral, union} from "./type-utils"

class ServersBuilder implements ICompilable {
  toCompilationUnit(): CompilationUnit {
    throw new Error("Method not implemented.")
  }
}

export abstract class TypescriptClientBuilder implements ICompilable {
  private readonly operations: string[] = []

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
  }

  serversClass() {
    const servers = this.input.servers()

    const toParams = (variables: {
      [k: string]: IRServerVariable
    }) => {
      return Object.entries(variables)
        .map(([name, variable]) => {
          const type = union(...variable.enum)
          return `${name}${type ? `:${type}` : ""} = "${variable.default}"`
        })
        .join(",")
    }

    const toReplacer = (server: IRServer) => {
      const vars = Object.entries(server.variables)
      return `"${server.url}"
      ${vars.length ? vars.map(([name]) => `.replace("{${name}}", ${name})`).join("\n") : ""}`
    }

    const toSpecific = () => {
      const urls = servers.map((it) => quotedStringLiteral(it.url))
      return `static specific(url: ${union(urls)}){
        switch(url) {
          ${servers
            .map(
              (server) => `
          case ${quotedStringLiteral(server.url)}:
            return {
              with(${toParams(server.variables)}) {
                return ${toReplacer(server)} as ${this.exportName}Server
              }
            }`,
            )
            .join("\n")}
        }
      }`
    }

    const defaultServer = servers[0]

    return `
    export type Server<T> = string & {__server__: T}

    export type ${this.exportName}Server = Server<"${this.exportName}Server">

    export class ${this.exportName}Servers {
      ${
        defaultServer
          ? `static default(${toParams(defaultServer.variables)}){
        return ${toReplacer(defaultServer)} as ${this.exportName}Server
        }`
          : ""
      }
      ${servers.length ? toSpecific() : ""}
      static custom(url: string){
        return url as ${this.exportName}Server
       }
    }
    `
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
    return this.buildClient(this.exportName, this.operations)
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
