import _ from "lodash"
import { Input } from "../../core/input"
import { IRModelObject, IROperation, IRParameter } from "../../core/openapi-types-normalized"
import { ImportBuilder } from "../common/import-builder"
import { emitGenerationResult, loadPreviousResult } from "../common/output-utils"
import { ModelBuilder } from "../common/model-builder"
import { isDefined, titleCase } from "../../core/utils"
import {logger} from "../../core/logger"
import {SchemaBuilder, schemaBuilderFactory} from "./schema-builders/schema-builder"

function reduceParamsToOpenApiSchema(parameters: IRParameter[]): IRModelObject {
  return parameters.reduce((acc, parameter) => {
    acc.properties[parameter.name] = parameter.schema

    if (parameter.required) {
      acc.required.push(parameter.name)
    }

    return acc
  }, {
    type: "object",
    properties: {},
    required: [],
    oneOf: [],
    allOf: [],
    additionalProperties: false,
    nullable: false,
    readOnly: false
  } as IRModelObject)
}

export class ServerBuilder {
  private readonly imports: ImportBuilder
  private readonly models: ModelBuilder
  private readonly schemaBuilder: SchemaBuilder

  private readonly statements: string[] = []
  private readonly operationTypeMap: Record<string, string> = {}

  constructor(
    public readonly filename: string,
    private readonly name: string,
    private readonly input: Input,
    models: ModelBuilder,
    private existingRegions: { [operationId: string]: string },
    schemaBuilderType: "zod" | "joi" = "zod",
  ) {
    this.imports = new ImportBuilder()
    // TODO: unsure why, but adding an export at `.` of index.ts doesn't work properly
    this.imports.from("@nahkies/typescript-koa-runtime/server")
      .add("startServer", "ServerConfig")

    this.imports.from("koa")
      .add("Context")

    this.imports.addModule("KoaRouter", "@koa/router")

    this.schemaBuilder = schemaBuilderFactory(schemaBuilderType, this.input, this.imports)
    this.models = models.withImports(this.imports)
  }

  add(operation: IROperation): void {
    const models = this.models
    const schemaBuilder = this.schemaBuilder

    const pathParams = operation.parameters.filter(it => it.in === "path")

    const paramSchema = pathParams.length ? schemaBuilder.fromParameters(pathParams) : undefined
    let pathParamsType = "void"

    const queryParams = operation.parameters.filter(it => it.in === "query")
    const querySchema = queryParams.length ? schemaBuilder.fromParameters(queryParams) : undefined
    let queryParamsType = "void"

    const { requestBodyParameter } = this.requestBodyAsParameter(operation)
    const bodyParamIsRequired = Boolean(requestBodyParameter?.required)
    const bodyParamSchema = requestBodyParameter ? schemaBuilder.fromModel(requestBodyParameter.schema, requestBodyParameter.required) : undefined
    let bodyParamsType = "void"

    if (paramSchema) {
      const name = `${ operation.operationId }ParamSchema`
      pathParamsType = models.schemaObjectToType({ $ref: this.input.loader.addVirtualType(operation.operationId, _.upperFirst(name), reduceParamsToOpenApiSchema(pathParams)) })
      this.statements.push(`const ${ name } = ${ paramSchema.toString() }`)
    }

    if (querySchema) {
      const name = `${ operation.operationId }QuerySchema`
      queryParamsType = models.schemaObjectToType({
        $ref: this.input.loader.addVirtualType(operation.operationId, _.upperFirst(name), reduceParamsToOpenApiSchema(queryParams)),
      })
      this.statements.push(`const ${ name } = ${ querySchema.toString() }`)
    }

    if (bodyParamSchema && requestBodyParameter) {
      const name = `${ operation.operationId }BodySchema`
      bodyParamsType = models.schemaObjectToType({
        $ref: this.input.loader.addVirtualType(operation.operationId, _.upperFirst(name), this.input.schema(requestBodyParameter.schema)),
      })
      this.statements.push(`const ${ name } = ${ bodyParamSchema }`)
    }


    this.operationTypeMap[operation.operationId] = `
        export type ${titleCase(operation.operationId)} = (
            params: Params<${ pathParamsType }, ${ queryParamsType }, ${ bodyParamsType + (bodyParamsType === "void" || bodyParamIsRequired ? "" : " | undefined") }>,
            ctx: Context
        ) => Promise<{status: number, body: any}>
`

    this.statements.push([
      `router.${ operation.method.toLowerCase() }('${ operation.operationId }','${ route(operation.route) }',`,
      `async (ctx, next) => {

       const input = {
        params: ${paramSchema ? `parseRequestInput(${ operation.operationId }ParamSchema, ctx.params)` : "undefined"},
        query: ${querySchema ? `parseRequestInput(${ operation.operationId }QuerySchema, ctx.query)` : "undefined"},
        body: ${bodyParamSchema ? `parseRequestInput(${ operation.operationId }BodySchema, ctx.body)` : "undefined"},
       }

        const {status, body} = await implementation.${operation.operationId}(input, ctx)
        ctx.status = status
        ctx.body = body
        return next();
      })`,
    ].filter(isDefined).join("\n"))
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
          name: "requestBody",
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
    const routes = this.statements
    const imports = this.imports

    return `
${ imports.toString() }

//region safe-edit-region-header
//endregion safe-edit-region-header
${Object.values(this.operationTypeMap).join("\n\n")}

export type Implementation = {
    ${Object.keys(this.operationTypeMap).map((key) => `${key}: ${titleCase(key)}`).join(",")}
}

export function bootstrap(implementation: Implementation, config: Omit<ServerConfig, "router">){
  // ${ clientName }
  const router = new KoaRouter()

  ${ routes.join("\n\n") }

  return startServer({
    middleware: [],
    router,
    port: config.port
  })
}
`
  }
}

function route(route: string): string {
  const placeholder = /{([^{}]+)}/g

  return Array.from(route.matchAll(placeholder))
    .reduce((result, match) => {
      return result.replace(match[0], ":" + _.camelCase(match[1]))
    }, route)
}

export async function generateTypescriptKoa({ dest, input }: { dest: string, input: Input }): Promise<void> {
  const models = ModelBuilder.fromInput("./models.ts", input)
  const server = new ServerBuilder("generated.ts", "ApiClient", input, models, loadExistingImplementations(await loadPreviousResult(dest, { filename: "index.ts" })))

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

  let safeRegionName = ""
  let buffer = []

  for (const line of data.split("\n")) {

    const match = regionBoundary.exec(line)

    if (match) {

      if (safeRegionName) {
        result[safeRegionName] = buffer.join("\n")
        buffer = []
        safeRegionName = ""
      } else {
        // this is safe because we tested that the regex matched prior to
        safeRegionName = match[1]
      }
    } else if (safeRegionName) {
      buffer.push(line)
    }
  }

  return result
}
