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
    const regex = /\{([^{}]+)}/g
    const placeholders: string[] = []
    let match: RegExpExecArray | null
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while ((match = regex.exec(server.url)) !== null) {
      if (match[1]) {
        placeholders.push(match[1])
      }
    }

    const variables = Object.keys(server.variables)

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

      if (server.variables[variable]?.default === undefined) {
        throw new Error(
          `server '${server.url}' has variable '${variable}' with no default value`,
        )
      }
    }
  }

  private toParams(
    variables: {
      [k: string]: IRServerVariable
    },
    includeDefault = true,
  ): string {
    return Object.entries(variables)
      .map(([name, variable]) => {
        const type = !includeDefault
          ? `${union(...variable.enum.map(quotedStringLiteral)) || "string"}`
          : union(...variable.enum.map(quotedStringLiteral))
        return `${name}${type ? `${!includeDefault ? "?" : ""}:${type}` : ""} ${includeDefault ? `= ${quotedStringLiteral(variable.default)}` : ""}`
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

  typeForDefault() {
    return `Server<"${this.name}">`
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

    return `${this.classExportName}.operations.${operationId}().build()`
  }

  typeForOperationId(operationId: string) {
    return `Server<"${operationId}_${this.name}">`
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