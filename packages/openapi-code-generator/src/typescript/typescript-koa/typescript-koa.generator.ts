import _ from "lodash"
import {Input} from "../../core/input"
import {IRModelObject, IROperation, IRParameter} from "../../core/openapi-types-normalized"
import {ImportBuilder} from "../common/import-builder"
import {emitGenerationResult, loadPreviousResult} from "../common/output-utils"
import {TypeBuilder} from "../common/type-builder"
import {isDefined, titleCase} from "../../core/utils"
import {SchemaBuilder, schemaBuilderFactory} from "../common/schema-builders/schema-builder"
import {requestBodyAsParameter, statusStringToType} from "../common/typescript-common"

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
  private readonly statements: string[] = []
  private readonly operationTypeMap: Record<string, string> = {}

  constructor(
    public readonly filename: string,
    private readonly name: string,
    private readonly input: Input,
    private readonly imports: ImportBuilder,
    public readonly types: TypeBuilder,
    public readonly schemaBuilder: SchemaBuilder,
    private existingRegions: { [operationId: string]: string },
  ) {
    // TODO: unsure why, but adding an export at `.` of index.ts doesn't work properly
    this.imports.from("@nahkies/typescript-koa-runtime/server")
      .add(
        "startServer",
        "ServerConfig",
        "Response",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
        "StatusCode",
      )

    this.imports.from("koa")
      .add("Context")

    this.imports.addModule("KoaRouter", "@koa/router")
    this.imports.addModule("koaBody", "koa-body")
  }

  add(operation: IROperation): void {
    const types = this.types
    const schemaBuilder = this.schemaBuilder

    const pathParams = operation.parameters.filter(it => it.in === "path")
    const paramSchema = pathParams.length ? schemaBuilder.fromParameters(pathParams) : undefined
    let pathParamsType = "void"

    const queryParams = operation.parameters.filter(it => it.in === "query")
    const querySchema = queryParams.length ? schemaBuilder.fromParameters(queryParams) : undefined
    let queryParamsType = "void"

    const {requestBodyParameter} = requestBodyAsParameter(operation)
    const bodyParamIsRequired = Boolean(requestBodyParameter?.required)
    const bodyParamSchema = requestBodyParameter ? schemaBuilder.fromModel(requestBodyParameter.schema, requestBodyParameter.required) : undefined
    let bodyParamsType = "void"

    if (paramSchema) {
      const name = `${operation.operationId}ParamSchema`
      pathParamsType = types.schemaObjectToType({$ref: this.input.loader.addVirtualType(operation.operationId, _.upperFirst(name), reduceParamsToOpenApiSchema(pathParams))})
      this.statements.push(`const ${name} = ${paramSchema.toString()}`)
    }

    if (querySchema) {
      const name = `${operation.operationId}QuerySchema`
      queryParamsType = types.schemaObjectToType({
        $ref: this.input.loader.addVirtualType(operation.operationId, _.upperFirst(name), reduceParamsToOpenApiSchema(queryParams)),
      })
      this.statements.push(`const ${name} = ${querySchema.toString()}`)
    }

    if (bodyParamSchema && requestBodyParameter) {
      const name = `${operation.operationId}BodySchema`
      bodyParamsType = types.schemaObjectToType({
        $ref: this.input.loader.addVirtualType(operation.operationId, _.upperFirst(name), this.input.schema(requestBodyParameter.schema)),
      })
      this.statements.push(`const ${name} = ${bodyParamSchema}`)
    }

    const responseSchemas = Object.entries(operation.responses ?? {}).reduce((acc, [status, response]) => {
      const content = Object.values(response.content ?? {}).pop()

      if (status === "default") {
        acc.defaultResponse = {
          schema: content ? schemaBuilder.fromModel(content.schema, true) : schemaBuilder.void(),
          type: content ? types.schemaObjectToType(content.schema) : "void",
        }
      } else {
        acc.specific.push({
          statusString: status,
          statusType: statusStringToType(status),
          type: content ? types.schemaObjectToType(content.schema) : "void",
          schema: content ? schemaBuilder.fromModel(content.schema, true) : schemaBuilder.void(),
        })
      }

      return acc
    }, {specific: [], defaultResponse: undefined} as {
      specific: { statusString: string, statusType: string, schema: string, type: string }[], defaultResponse?: {
        type: string, schema: string
      }
    })

    this.operationTypeMap[operation.operationId] = `
        export type ${titleCase(operation.operationId)} = (
            params: Params<${pathParamsType}, ${queryParamsType}, ${bodyParamsType + (bodyParamsType === "void" || bodyParamIsRequired ? "" : " | undefined")}>,
            ctx: Context
        ) => Promise<
        ${[
      ...responseSchemas.specific.map(it => `Response<${it.statusType}, ${it.type}>`),
      responseSchemas.defaultResponse && `Response<StatusCode, ${responseSchemas.defaultResponse.type}>`,
    ].filter(isDefined).join(" | ")}
        >
`
    this.statements.push([
      `const ${operation.operationId}ResponseValidator = responseValidationFactory([${
        responseSchemas.specific.map(it => `["${it.statusString}", ${it.schema}]`)}
      ], ${responseSchemas.defaultResponse?.schema})`,
      "",
      `router.${operation.method.toLowerCase()}('${operation.operationId}','${route(operation.route)}',`,
      `async (ctx, next) => {

       const input = {
        params: ${paramSchema ? `parseRequestInput(${operation.operationId}ParamSchema, ctx.params)` : "undefined"},
        query: ${querySchema ? `parseRequestInput(${operation.operationId}QuerySchema, ctx.query)` : "undefined"},
        body: ${bodyParamSchema ? `parseRequestInput(${operation.operationId}BodySchema, ctx.request.body)` : "undefined"},
       }

        const {status, body} = await implementation.${operation.operationId}(input, ctx)

        ctx.body = ${operation.operationId}ResponseValidator(status, body)
        ctx.status = status
        return next();
      })`,
    ].filter(isDefined).join("\n"))
  }

  toString(): string {
    const clientName = this.name
    const routes = this.statements
    const imports = this.imports

    return `
${imports.toString()}

//region safe-edit-region-header
${this.existingRegions["header"] ?? ""}
//endregion safe-edit-region-header
${Object.values(this.operationTypeMap).join("\n\n")}

export type Implementation = {
    ${Object.keys(this.operationTypeMap).map((key) => `${key}: ${titleCase(key)}`).join(",")}
}

export function bootstrap(implementation: Implementation, config: Omit<ServerConfig, "router">){
  // ${clientName}
  const router = new KoaRouter()

  ${routes.join("\n\n")}

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

export async function generateTypescriptKoa({dest, input}: { dest: string, input: Input }): Promise<void> {
  const imports = new ImportBuilder()
  const types = TypeBuilder.fromInput("./models.ts", input).withImports(imports)
  const schemaBuilder = schemaBuilderFactory("zod", input, imports)

  const server = new ServerBuilder(
    "generated.ts",
    "ApiClient",
    input,
    imports,
    types,
    schemaBuilder,
    loadExistingImplementations(await loadPreviousResult(dest, {filename: "index.ts"}))
  )

  input.allOperations()
    .map(it => server.add(it))

  await emitGenerationResult(dest, [
    types,
    server,
    schemaBuilder,
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
