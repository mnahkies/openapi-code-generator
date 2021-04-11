import _ from "lodash"
import { Input } from "../../core/input"
import { IRModelObject, IROperation, IRParameter} from "../../core/openapi-types-normalized"
import { ImportBuilder } from "../common/import-builder"
import { emitGenerationResult, loadPreviousResult } from "../common/output-utils"
import { ModelBuilder } from "../common/model-builder"
import { isDefined } from "../../core/utils"
import { logger } from "../../core/logger"
import { JoiBuilder } from "./joi-schema-builder"

function reduceParamsToOpenApiSchema(parameters: IRParameter[]): IRModelObject {
  return parameters.reduce((acc, parameter) => {
    acc.properties[parameter.name] = parameter.schema
    return acc
  }, { type: 'object', properties: {} } as IRModelObject)
}

export class ServerBuilder {
  private readonly imports: ImportBuilder
  private readonly models: ModelBuilder
  private readonly joiBuilder: JoiBuilder

  private readonly operations: string[] = []

  constructor(
    public readonly filename: string,
    private readonly name: string,
    private readonly input: Input,
    models: ModelBuilder,
    private existingRegions: { [operationId: string]: string },
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
    this.joiBuilder = new JoiBuilder('joi', this.input)
  }

  add(operation: IROperation): void {
    const models = this.models
    const joiBuilder = this.joiBuilder

    const pathParams = operation.parameters.filter(it => it.in === "path")
    const paramSchema = pathParams.length ? joiBuilder.fromParameters(pathParams) : undefined
    let pathParamsType = 'void'

    const queryParams = operation.parameters.filter(it => it.in === "query")
    const querySchema = queryParams.length ? joiBuilder.fromParameters(queryParams) : undefined
    let queryParamsType = 'void'

    const { requestBodyParameter } = this.requestBodyAsParameter(operation)
    const bodyParamSchema = requestBodyParameter ? joiBuilder.fromModel(requestBodyParameter.schema, requestBodyParameter.required) : undefined
    let bodyParamsType = 'void'

    if (paramSchema) {
      let name = `${ operation.operationId }ParamSchema`
      pathParamsType = models.schemaObjectToType({ $ref: this.input.loader.addVirtualType(operation.operationId, _.upperFirst(name), reduceParamsToOpenApiSchema(pathParams)) })
      this.operations.push(`const ${ name } = ${ paramSchema.toString() }`)
    }

    if (querySchema) {
      let name = `${ operation.operationId }QuerySchema`
      queryParamsType = models.schemaObjectToType({
        $ref: this.input.loader.addVirtualType(operation.operationId, _.upperFirst(name), reduceParamsToOpenApiSchema(queryParams)),
      })
      this.operations.push(`const ${ name } = ${ querySchema.toString() }`)
    }

    if (bodyParamSchema && requestBodyParameter) {
      let name = `${ operation.operationId }BodySchema`
      bodyParamsType = models.schemaObjectToType({
        $ref: this.input.loader.addVirtualType(operation.operationId, _.upperFirst(name), this.input.schema(requestBodyParameter.schema)),
      })
      this.operations.push(`const ${ name } = ${ bodyParamSchema }`)
    }

    this.operations.push([
      `router.${ operation.method.toLowerCase() }('${ operation.operationId }','${ route(operation.route) }',`,
      paramSchema && `paramValidationFactory<${ pathParamsType }>(${ operation.operationId }ParamSchema),`,
      querySchema && `queryValidationFactory<${ queryParamsType }>(${ operation.operationId }QuerySchema),`,
      bodyParamSchema && `bodyValidationFactory<${ bodyParamsType }>(${ operation.operationId }BodySchema),`,
      `async (ctx: ValidatedCtx<${ pathParamsType }, ${ queryParamsType }, ${ bodyParamsType }>, next) => {
        //region safe-edit-region-${ operation.operationId }
        ${ this.existingRegions[operation.operationId] ?? `
        ctx.status = 501
        ctx.body = {error: "not implemented"}
        return next();
        ` }
        //endregion safe-edit-region-${ operation.operationId }
      })`,
    ].filter(isDefined).join('\n'))
  }

  requestBodyAsParameter(operation: IROperation): { requestBodyParameter?: IRParameter, requestBodyContentType?: string } {
    const { requestBody } = operation

    if (!requestBody) {
      return {}
    }

    // todo support multiple request body types
    for (const [requestBodyContentType, definition] of Object.entries(requestBody.content)) {
      return {
        requestBodyContentType,
        requestBodyParameter: {
          name: 'requestBody',
          description: requestBody.description,
          in: "body",
          required: requestBody.required,
          schema: definition.schema,
          allowEmptyValue: false,
          deprecated: false,
        },
      }
    }

    logger.warn("no content on defined request body ", requestBody)
    return {}
  }

  toString(): string {
    const clientName = this.name
    const routes = this.operations
    const imports = this.imports

    return `
${ imports.toString() }

//region safe-edit-region-header
//endregion safe-edit-region-header

function paramValidationFactory<Type>(schema: joi.Schema): Middleware<{ params: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.params, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.state.params = result.value

    return next()
  }
}

function queryValidationFactory<Type>(schema: joi.Schema): Middleware<{ query: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.query, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.state.query = result.value

    return next()
  }
}

function bodyValidationFactory<Type>(schema: joi.Schema): Middleware<{ body: Type }> {
  return async function (ctx: Context, next: Next) {
    const result = schema.validate(ctx.request.body, { stripUnknown: true })

    if (result.error) {
      throw new Error("validation error")
    }

    ctx.state.body = result.value

    return next()
  }
}

interface ValidatedCtx<Params, Query, Body> extends Context {
  state: { params: Params, query: Query, body: Body }
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
  const server = new ServerBuilder('index.ts', 'ApiClient', input, models, loadExistingImplementations(await loadPreviousResult(dest, { filename: 'index.ts' })))

  input.allOperations()
    .map(it => server.add(it))

  await emitGenerationResult(dest, [
    models,
    server,
  ])
}

const regionBoundary = /.+safe-edit-region-(.+)/

function loadExistingImplementations(data: string): Record<string, string> {
  const result: Record<string, string> = {}

  let safeRegionName = ''
  let buffer = []

  for (const line of data.split('\n')) {

    const match = regionBoundary.exec(line)

    if (match) {

      if (safeRegionName) {
        result[safeRegionName] = buffer.join('\n')
        buffer = []
        safeRegionName = ''
      } else {
        // this is safe because we tested that the regex matched prior to
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        safeRegionName = match[1]
      }
    } else if (safeRegionName) {
      buffer.push(line)
    }
  }

  return result
}
