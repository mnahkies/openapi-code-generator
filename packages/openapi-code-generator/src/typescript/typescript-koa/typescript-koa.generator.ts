import { Input } from "../../core/input"
import { IROperation } from "../../core/openapi-types-normalized"
import { ImportBuilder } from "../common/import-builder"
import { emitGenerationResult } from "../common/output-utils"
import { ModelBuilder } from "../common/model-builder"

export class ServerBuilder {
  private readonly imports: ImportBuilder
  private readonly models: ModelBuilder

  private readonly operations: string[] = []

  constructor(
    public readonly filename: string,
    private readonly name: string,
    models: ModelBuilder,
  ) {
    this.imports = new ImportBuilder()
    this.imports.addModule('Koa', 'koa')
    this.imports.addModule('KoaRouter', '@koa/router')
    this.imports.addModule('koaBody', 'koa-body')
    this.imports.addModule('cors', '@koa/cors')

    this.models = models.withImports(this.imports)
  }

  add(operation: IROperation): void {
    const models = this.models

    this.operations.push(`router.${ operation.method.toLowerCase() }('${ operation.route }', async (ctx, next) => {

    ctx.status = 501
    ctx.body = {error: "not implemented"}
    return next();
    })`)
  }

  toString(): string {
    const clientName = this.name
    const routes = this.operations
    const imports = this.imports

    return `
${ imports.toString() }

const PORT=3000

// ${ clientName }
const server = new Koa()

server.use(cors())
server.use(koaBody())

const router = new KoaRouter

${ routes.join('\n\n') }

  server.use(router.allowedMethods())
  server.use(router.routes())

server.listen(PORT, () => {
  console.info("server listening", {port: PORT})
});
`
  }
}

export async function generateTypescriptKoa({ dest, input }: { dest: string, input: Input }): Promise<void> {
  const models = ModelBuilder.fromInput('./models.ts', input)
  const server = new ServerBuilder('index.ts', 'ApiClient', models)

  input.allOperations()
    .map(it => server.add(it))

  await emitGenerationResult(dest, [
    models,
    server,
  ])
}
