import type {Input} from "../../../core/input"
import {CompilationUnit, type ICompilable} from "../../common/compilation-units"
import {ImportBuilder} from "../../common/import-builder"

export class KoaServerBuilder implements ICompilable {
  constructor(
    public readonly filename: string,
    private readonly name: string,
    private readonly input: Input,
    private readonly imports: ImportBuilder = new ImportBuilder(),
  ) {
    this.imports
      .from("@nahkies/typescript-koa-runtime/server")
      .add(
        "startServer",
        "ServerConfig",
        "Response",
        "KoaRuntimeResponse",
        "KoaRuntimeResponder",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
        "StatusCode",
      )
  }

  toString(): string {
    return `
      export async function bootstrap(config: ServerConfig) {
        // ${this.name}
        return startServer(config)
      }
    `
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
