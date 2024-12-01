import type {
  IRServer,
  IRServerVariable,
} from "../../core/openapi-types-normalized"
import {CompilationUnit, type ICompilable} from "./compilation-units"
import type {ImportBuilder} from "./import-builder"
import {quotedStringLiteral, union} from "./type-utils"

export class ClientServersBuilder implements ICompilable {
  constructor(
    readonly filename: string,
    readonly name: string,
    readonly servers: IRServer[],
    readonly imports: ImportBuilder,
  ) {}

  private toParams(variables: {
    [k: string]: IRServerVariable
  }) {
    return Object.entries(variables)
      .map(([name, variable]) => {
        const type = union(...variable.enum)
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
    static default(${this.toParams(defaultServer.variables)}): ${this.typeExportName} {
      return (${this.toReplacer(defaultServer)} as ${this.typeExportName})
    }
    `
  }

  private toSpecific() {
    if (!this.servers.length) {
      return ""
    }

    const urls = this.servers.map((it) => quotedStringLiteral(it.url))
    return `static specific(url: ${union(urls)}){
        switch(url) {
          ${this.servers
            .map(
              (server) => `
          case ${quotedStringLiteral(server.url)}:
            return {
              with(${this.toParams(server.variables)}): ${this.typeExportName} {
                return (${this.toReplacer(server)} as ${this.typeExportName})
              }
            }
            `,
            )
            .join("\n")}
        }
      }`
  }

  get classExportName(): string {
    return `${this.name}Servers`
  }
  get typeExportName(): string {
    return `${this.name}Server`
  }

  toString() {
    return `
    export type Server<T> = string & {__server__: T}

    export type ${this.typeExportName} = Server<"${this.typeExportName}">

    export class ${this.classExportName} {
      ${this.toDefault()}
      ${this.toSpecific()}

      static custom(url: string): ${this.typeExportName} {
        return (url as ${this.typeExportName})
       }
    }
    `
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
