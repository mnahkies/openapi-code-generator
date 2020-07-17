import { Input } from "../../core/input"
import { IRModel, IROperation, IRParameter } from "../../core/openapi-types-normalized"
import { ImportBuilder } from "../common/import-builder"
import { emitGenerationResult } from "../common/output-utils"
import { ModelBuilder } from "../common/model-builder"
import _ from "lodash"
import { isDefined } from "../../core/utils"


class JoiObjectSchemaBuilder {

  private readonly values: Record<string, string> = {}

  private constructor(private readonly joi: string = 'joi') {
  }

  static objectFromParameters(input: Input, parameters: IRParameter[]) {
    const builder = new JoiObjectSchemaBuilder()

    parameters.forEach(parameter => {
      builder.add(parameter.name, input.schema(parameter.schema), parameter.required)
    })

    return builder
  }

  private add(name: string, schema: IRModel, required: boolean) {

    const parts = [this.joi]

    switch (schema.type) {
      case "number":
        parts.push('number()')
        break
      case "string":
        parts.push('string()')
        break
      case "boolean":
        parts.push('boolean()')
        break
      case "array":
        parts.push('array()')
        break
      case "object":
        parts.push('object()')
        break
    }

    if (required) {
      parts.push('required()')
    }

    this.values[name] = parts.join('.')
  }

  toString() {
    return [this.joi, 'object()', `keys({ ${ Object.entries(this.values).map(([key, value]) => `"${ key }": ${ value }`).join(',') } })`]
      .join('.')
  }
}

export class ServerBuilder {
  private readonly imports: ImportBuilder
  private readonly models: ModelBuilder

  private readonly operations: string[] = []

  constructor(
    public readonly filename: string,
    private readonly name: string,
    private readonly input: Input,
    models: ModelBuilder,
  ) {
    this.imports = new ImportBuilder()
    this.imports.addModule('Koa', 'koa')
    this.imports.addSingle('Middleware', 'koa')
    this.imports.addSingle('Context', 'koa')
    this.imports.addSingle('Next', 'koa')
    this.imports.addModule('KoaRouter', '@koa/router')
    this.imports.addModule('koaBody', 'koa-body')
    this.imports.addModule('cors', '@koa/cors')
    this.imports.addModule('joi', '@hapi/joi')

    this.models = models.withImports(this.imports)
  }

  add(operation: IROperation): void {
    const models = this.models

    const pathParams = operation.parameters.filter(it => it.in === "path")
    const paramSchema = pathParams.length ? JoiObjectSchemaBuilder.objectFromParameters(this.input, pathParams) : undefined

    const queryParams = operation.parameters.filter(it => it.in === "query")
    const querySchema = queryParams.length ? JoiObjectSchemaBuilder.objectFromParameters(this.input, queryParams) : undefined

    if (paramSchema) {
      this.operations.push(`const ${ operation.operationId }ParamSchema = ${ paramSchema.toString() }`)
    }

    if (querySchema) {
      this.operations.push(`const ${ operation.operationId }QuerySchema = ${ querySchema.toString() }`)
    }


    this.operations.push([
      `router.${ operation.method.toLowerCase() }('${ operation.operationId }','${ route(operation.route) }',`,
      paramSchema && `paramValidationFactory<any>(${ operation.operationId }ParamSchema),`,
      querySchema && `queryValidationFactory<any>(${ operation.operationId }QuerySchema),`,
      `async (ctx, next) => {

      ctx.status = 501
      ctx.body = {error: "not implemented"}
      return next();
      })`,
    ].filter(isDefined).join('\n'))
  }

  toString(): string {
    const clientName = this.name
    const routes = this.operations
    const imports = this.imports

    return `
${ imports.toString() }

function paramValidationFactory<Type>(schema: joi.Schema): Middleware<{}, { params: Type }> {
  return function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.params, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.params = result.value

    next()
  }
}

function queryValidationFactory<Type>(schema: joi.Schema): Middleware<{}, { query: Type }> {
  return function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.query, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.query = result.value

    next()
  }
}

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

function route(route: string): string {
  const placeholder = /{([^{}]+)}/g

  return Array.from(route.matchAll(placeholder))
    .reduce((result, match) => {
      return result.replace(match[0], ':' + _.camelCase(match[1]))
    }, route)
}

export async function generateTypescriptKoa({ dest, input }: { dest: string, input: Input }): Promise<void> {
  const models = ModelBuilder.fromInput('./models.ts', input)
  const server = new ServerBuilder('index.ts', 'ApiClient', input, models)

  input.allOperations()
    .map(it => server.add(it))

  await emitGenerationResult(dest, [
    models,
    server,
  ])
}
