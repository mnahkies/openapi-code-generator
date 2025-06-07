import type {
  IROperation,
  IRServer,
  IRServerVariable,
} from "../../core/openapi-types-normalized"
import {extractPlaceholders} from "../../core/openapi-utils"
import {isDefined} from "../../core/utils"
import {CompilationUnit, type ICompilable} from "../common/compilation-units"
import type {ImportBuilder} from "../common/import-builder"
import {quotedStringLiteral, union} from "../common/type-utils"

export class ClientServersBuilder implements ICompilable {
  readonly operations: Pick<IROperation, "operationId" | "servers">[] = []

  constructor(
    readonly filename: string,
    readonly name: string,
    readonly servers: IRServer[],
    readonly imports: ImportBuilder,
    readonly config = {enableTypedBasePaths: true},
  ) {
    for (const server of servers) {
      this.validateServer(server)
    }
  }

  addOperation(operation: Pick<IROperation, "operationId" | "servers">) {
    if (operation.servers.length) {
      for (const server of operation.servers) {
        this.validateServer(server)
      }
      this.operations.push(operation)
    }
  }

  private validateServer(server: IRServer) {
    const placeholders = extractPlaceholders(server.url)
      .map((it) => it.placeholder)
      .filter(isDefined)

    const variables = server.variables.map((it) => it.name)

    for (const placeholder of placeholders) {
      if (!variables.includes(placeholder)) {
        throw new Error(
          `server '${server.url}' has placeholder '${placeholder}' but no variable with that name`,
        )
      }
    }

    for (const variable of variables) {
      if (!placeholders.includes(variable)) {
        throw new Error(
          `server '${server.url}' has variable '${variable}' but no placeholder with that name`,
        )
      }
    }
  }

  private toParams(
    variables: IRServerVariable[],
    includeDefault = true,
  ): string {
    return variables
      .map((it) => {
        const type = !includeDefault
          ? `${union(...it.enum.map(quotedStringLiteral)) || "string"}`
          : union(...it.enum.map(quotedStringLiteral))
        return `${it.name}${type ? `${!includeDefault && it.default ? "?" : ""}:${type}` : ""} ${includeDefault && it.default ? `= ${quotedStringLiteral(it.default)}` : ""}`
      })
      .join(",")
  }

  private toReplacer(server: IRServer) {
    return `"${server.url}" ${server.variables.length ? server.variables.map((it) => `.replace("{${it.name}}", ${it.name})`).join("\n") : ""}`
  }

  private toDefault() {
    const defaultServer = this.servers[0]
    const variablesWithoutDefault = defaultServer?.variables.filter(
      (it) => !it.default,
    )

    if (!defaultServer || variablesWithoutDefault?.length) {
      return ""
    }

    return `
    static default(): ${this.typeForDefault()} {
      return ${this.classExportName}.server().build()
    }
    `
  }

  private toSpecific(name: string, servers: IRServer[], typeName: string) {
    if (!servers[0]) {
      return ""
    }

    const defaultUrl = quotedStringLiteral(servers[0].url)

    const overloads = servers.map((it) => {
      return `static ${name}(url?: ${quotedStringLiteral(it.url)}): {build: (${this.toParams(it.variables, false)}) => ${typeName}};`
    })

    const switchSnippet = `
        switch(url) {
          ${servers
            .map(
              (it) => `
          case ${quotedStringLiteral(it.url)}:
            return {
              build(${this.toParams(it.variables)}): ${typeName} {
                return (${this.toReplacer(it)} as ${typeName})
              }
            }
        `,
            )
            .join("\n")}
            default: throw new Error(\`no matching server for url '\${url}'\`)
        }
    `

    if (overloads.length > 1) {
      return `
    ${overloads.join("\n")}
    static ${name}(url: string = ${defaultUrl}): unknown {
        ${switchSnippet}
    }`
    }

    return `
    static ${name}(url: ${defaultUrl} = ${defaultUrl}): {build: (${this.toParams(servers[0].variables, false)}) => ${typeName}} {
        ${switchSnippet}
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

  default() {
    if (this.config.enableTypedBasePaths && this.toDefault() !== "") {
      return `${this.classExportName}.default()`
    }
    return "''"
  }

  typeForDefault() {
    if (this.config.enableTypedBasePaths) {
      return `Server<"${this.name}">`
    }
    return "string"
  }

  defaultForOperationId(operationId: string) {
    const operation = this.operations.find(
      (it) => it.operationId === operationId,
    )

    if (!operation) {
      throw new Error(`no operation with id '${operationId}'`)
    }

    const hasServers = operation.servers.length > 0

    if (!hasServers) {
      throw new Error(`no server overrides for operation '${operationId}'`)
    }

    if (this.config.enableTypedBasePaths) {
      return `${this.classExportName}.operations.${operationId}().build()`
    }
    return ""
  }

  typeForOperationId(operationId: string) {
    if (this.config.enableTypedBasePaths) {
      return `Server<"${operationId}_${this.name}">`
    }
    return "string"
  }

  toString() {
    if (
      (!this.hasServers && !this.hasOperationServers) ||
      !this.config.enableTypedBasePaths
    ) {
      return ""
    }

    const operations = this.operations
      .map((it) =>
        this.toSpecific(
          it.operationId,
          it.servers,
          this.typeForOperationId(it.operationId),
        ),
      )
      .join("\n")

    return `
    ${
      operations.length
        ? `
      export class ${this.classExportName}Operations {
      ${operations}
      }`
        : ""
    }

    export class ${this.classExportName} {
      ${this.toDefault()}
      ${this.toSpecific("server", this.servers, this.typeForDefault())}

       ${
         operations.length
           ? `static readonly operations = ${this.classExportName}Operations`
           : ""
       }
    }
    `
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
