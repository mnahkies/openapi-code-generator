import type {
  IROperation,
  IRServer,
  IRServerVariable,
} from "../../core/openapi-types-normalized"
import {CompilationUnit, type ICompilable} from "./compilation-units"
import type {ImportBuilder} from "./import-builder"
import {quotedStringLiteral, union} from "./type-utils"

export class ClientServersBuilder implements ICompilable {
  readonly operations: Pick<IROperation, "operationId" | "servers">[] = []

  constructor(
    readonly filename: string,
    readonly name: string,
    readonly servers: IRServer[],
    readonly imports: ImportBuilder,
  ) {}

  addOperation(operation: Pick<IROperation, "operationId" | "servers">) {
    if (operation.servers.length) {
      this.operations.push(operation)
    }
  }

  private toParams(variables: {
    [k: string]: IRServerVariable
  }) {
    return Object.entries(variables)
      .map(([name, variable]) => {
        const type = union(...variable.enum.map(quotedStringLiteral))
        return `${name}${type ? `:${type}` : ""} = "${variable.default}"`
      })
      .join(",")
  }

  private toReplacer(server: IRServer) {
    const vars = Object.entries(server.variables)
    return `"${server.url}" ${vars.length ? vars.map(([name]) => `.replace("{${name}}", ${name})`).join("\n") : ""}`
  }

  private toDefault() {
    const defaultServer = this.servers[0]

    if (!defaultServer) {
      return ""
    }

    return `
    static default(${this.toParams(defaultServer.variables)}): ${this.typeForDefault()} {
      return (${this.toReplacer(defaultServer)} as ${this.typeForDefault()})
    }
    `
  }

  private toSpecific(
    name: string,
    servers: IRServer[],
    typeName: string,
    isStatic = true,
  ) {
    if (!this.hasServers) {
      return ""
    }

    const urls = servers.map((it) => quotedStringLiteral(it.url))
    return `${isStatic ? "static " : ""}${name}(url: ${union(urls)}){
        switch(url) {
          ${servers
            .map(
              (server) => `
          case ${quotedStringLiteral(server.url)}:
            return ${
              Object.keys(server.variables).length > 0
                ? `{
            build(${this.toParams(server.variables)}): ${typeName} {
                return (${this.toReplacer(server)} as ${typeName})
              }
            }`
                : `(${quotedStringLiteral(server.url)} as ${typeName})`
            }
            `,
            )
            .join("\n")}
        }
      }`
  }

  get hasServers() {
    return this.servers.length > 0
  }

  get hasOperationServers() {
    return this.operations.length > 0
  }

  get classExportName(): string {
    return `${this.name}Servers`
  }

  typeForDefault() {
    return `Server<"${this.name}">`
  }

  typeForCustom() {
    return `Server<"${this.name}Custom">`
  }

  defaultForOperationId(operationId: string) {
    const operation = this.operations.find(
      (it) => it.operationId === operationId,
    )

    if (!operation) {
      throw new Error(`no operation with id '${operationId}'`)
    }

    const defaultServer = operation.servers[0]

    if (!defaultServer) {
      throw new Error(`no default server for operation '${operationId}'`)
    }

    const hasVariables = Object.keys(defaultServer.variables).length > 0

    return `${this.classExportName}.operations.${operationId}(${quotedStringLiteral(defaultServer.url)})${hasVariables ? ".build()" : ""}`
  }

  typeForOperationId(operationId: string) {
    return `Server<"${operationId}">`
  }

  toString() {
    if (!this.hasServers && !this.hasOperationServers) {
      return ""
    }

    const operations = this.operations
      .map((it) =>
        this.toSpecific(
          it.operationId,
          it.servers,
          this.typeForOperationId(it.operationId),
          false,
        ),
      )
      .join(",\n")

    return `
    export class ${this.classExportName} {
      ${this.toDefault()}
      ${this.toSpecific("specific", this.servers, this.typeForDefault())}

      static custom(url: string): ${this.typeForCustom()} {
        return (url as ${this.typeForCustom()})
       }

       ${
         operations.length
           ? `static readonly operations = {
        ${operations}
        }`
           : ""
       }
    }
    `
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
