import type {Input} from "../../../core/input"
import {CompilationUnit, type ICompilable} from "../../common/compilation-units"
import type {ImportBuilder} from "../../common/import-builder"

export class ExpressServerBuilder implements ICompilable {
  constructor(
    private readonly filename: string,
    private readonly name: string,
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: future
    private readonly input: Input,
    private readonly imports: ImportBuilder,
  ) {
    this.imports
      .from("@nahkies/typescript-express-runtime/server")
      .add("startServer")
      .addType("ServerConfig")
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
