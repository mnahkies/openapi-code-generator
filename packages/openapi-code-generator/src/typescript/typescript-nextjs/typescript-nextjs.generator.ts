import path from "path"
import _ from "lodash"
import {Input} from "../../core/input"
import {
  IRModelObject,
  IROperation,
  IRParameter,
} from "../../core/openapi-types-normalized"
import {titleCase} from "../../core/utils"
import {OpenapiGeneratorConfig} from "../../templates.types"
import {CompilationUnit, ICompilable} from "../common/compilation-units"
import {ImportBuilder} from "../common/import-builder"
import {emitGenerationResult, loadPreviousResult} from "../common/output-utils"
import {JoiBuilder} from "../common/schema-builders/joi-schema-builder"
import {
  SchemaBuilder,
  schemaBuilderFactory,
} from "../common/schema-builders/schema-builder"
import {ZodBuilder} from "../common/schema-builders/zod-schema-builder"
import {TypeBuilder} from "../common/type-builder"
import {intersect, object} from "../common/type-utils"
import {
  buildExport,
  requestBodyAsParameter,
  statusStringToType,
} from "../common/typescript-common"

function reduceParamsToOpenApiSchema(parameters: IRParameter[]): IRModelObject {
  return parameters.reduce(
    (acc, parameter) => {
      acc.properties[parameter.name] = parameter.schema

      if (parameter.required) {
        acc.required.push(parameter.name)
      }

      return acc
    },
    {
      type: "object",
      properties: {},
      required: [],
      oneOf: [],
      allOf: [],
      anyOf: [],
      additionalProperties: false,
      nullable: false,
      readOnly: false,
    } as IRModelObject,
  )
}

export class ServerRouterBuilder implements ICompilable {
  private readonly statements: string[] = []
  private readonly operationTypes: {
    operationId: string
    statements: string[]
  }[] = []

  constructor(
    public readonly filename: string,
    private readonly name: string,
    private readonly input: Input,
    private readonly imports: ImportBuilder,
    public readonly types: TypeBuilder,
    public readonly schemaBuilder: SchemaBuilder,
    private existingRegions: {
      [operationId: string]: string
    },
  ) {
    // todo: unsure why, but adding an export at `.` of index.ts doesn't work properly
    this.imports
      .from("@nahkies/typescript-koa-runtime/server")
      .add(
        "startServer",
        "ServerConfig",
        "KoaRuntimeResponse",
        "KoaRuntimeResponder",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
        "StatusCode",
      )

    this.imports.from("next/server").add("NextRequest")

    this.imports
      .from("@nahkies/typescript-koa-runtime/errors")
      .add("KoaRuntimeError", "RequestInputType")

    if (schemaBuilder instanceof ZodBuilder) {
      imports
        .from("@nahkies/typescript-koa-runtime/zod")
        .add("parseRequestInput", "Params", "responseValidationFactory")
    } else if (schemaBuilder instanceof JoiBuilder) {
      imports
        .from("@nahkies/typescript-koa-runtime/joi")
        .add("parseRequestInput", "Params", "responseValidationFactory")
    }
  }

  add(operation: IROperation): void {
    const types = this.types
    const schemaBuilder = this.schemaBuilder

    const pathParams = operation.parameters.filter((it) => it.in === "path")
    const paramSchema = pathParams.length
      ? schemaBuilder.fromParameters(pathParams)
      : undefined
    let pathParamsType = "void"

    const queryParams = operation.parameters.filter((it) => it.in === "query")
    const querySchema = queryParams.length
      ? schemaBuilder.fromParameters(queryParams)
      : undefined
    let queryParamsType = "void"

    const {requestBodyParameter} = requestBodyAsParameter(operation)
    const bodyParamIsRequired = Boolean(requestBodyParameter?.required)
    const bodyParamSchema = requestBodyParameter
      ? schemaBuilder.fromModel(
          requestBodyParameter.schema,
          requestBodyParameter.required,
          true,
        )
      : undefined
    let bodyParamsType = "void"

    if (paramSchema) {
      const name = `${operation.operationId}ParamSchema`
      pathParamsType = types.schemaObjectToType(
        this.input.loader.addVirtualType(
          operation.operationId,
          _.upperFirst(name),
          reduceParamsToOpenApiSchema(pathParams),
        ),
      )
      this.statements.push(`const ${name} = ${paramSchema.toString()}`)
    }

    if (querySchema) {
      const name = `${operation.operationId}QuerySchema`
      queryParamsType = types.schemaObjectToType(
        this.input.loader.addVirtualType(
          operation.operationId,
          _.upperFirst(name),
          reduceParamsToOpenApiSchema(queryParams),
        ),
      )
      this.statements.push(`const ${name} = ${querySchema.toString()}`)
    }

    if (bodyParamSchema && requestBodyParameter) {
      const name = `${operation.operationId}BodySchema`
      bodyParamsType = types.schemaObjectToType(
        this.input.loader.addVirtualType(
          operation.operationId,
          _.upperFirst(name),
          this.input.schema(requestBodyParameter.schema),
        ),
      )
      this.statements.push(`const ${name} = ${bodyParamSchema}`)
    }

    const responseSchemas = Object.entries(operation.responses ?? {}).reduce(
      (acc, [status, response]) => {
        const content = Object.values(response.content ?? {}).pop()

        if (status === "default") {
          acc.defaultResponse = {
            schema: content
              ? schemaBuilder.fromModel(content.schema, true, true)
              : schemaBuilder.void(),
            type: content ? types.schemaObjectToType(content.schema) : "void",
          }
        } else {
          acc.specific.push({
            statusString: status,
            statusType: statusStringToType(status),
            type: content ? types.schemaObjectToType(content.schema) : "void",
            schema: content
              ? schemaBuilder.fromModel(content.schema, true, true)
              : schemaBuilder.void(),
            isWildCard: /^\d[xX]{2}$/.test(status),
          })
        }

        return acc
      },
      {specific: [], defaultResponse: undefined} as {
        specific: {
          statusString: string
          statusType: string
          schema: string
          type: string
          isWildCard: boolean
        }[]
        defaultResponse?:
          | {
              type: string
              schema: string
            }
          | undefined
      },
    )

    this.operationTypes.push({
      operationId: operation.operationId,
      statements: [
        buildExport({
          name: titleCase(operation.operationId) + "Responder",
          value: intersect(
            object([
              ...responseSchemas.specific.map((it) =>
                it.isWildCard
                  ? `with${it.statusType}(status: ${it.statusType}): KoaRuntimeResponse<${it.type}>`
                  : `with${it.statusType}(): KoaRuntimeResponse<${it.type}>`,
              ),
              responseSchemas.defaultResponse &&
                `withDefault(status: StatusCode): KoaRuntimeResponse<${responseSchemas.defaultResponse.type}>`,
            ]),
            "KoaRuntimeResponder",
          ),
          kind: "type",
        }),
        buildExport({
          name: titleCase(operation.operationId),
          value: `(
                    params: Params<${pathParamsType}, ${queryParamsType}, ${
                      bodyParamsType +
                      (bodyParamsType === "void" || bodyParamIsRequired
                        ? ""
                        : " | undefined")
                    }>,
                    respond: ${titleCase(operation.operationId) + "Responder"},
                    ctx: {request: NextRequest}
                  ) => Promise<KoaRuntimeResponse<unknown>>`,
          kind: "type",
        }),
      ],
    })

    this.statements.push(
      buildExport({
        name: operation.method.toUpperCase(),
        kind: "const",
        value: `async (request: NextRequest, {params}: {params: unknown}): Promise<Response> => {
  const input = {
        params: ${
          paramSchema
            ? `parseRequestInput(${operation.operationId}ParamSchema, params, RequestInputType.RouteParam)`
            : "undefined"
        },
        // TODO: this swallows repeated parameters
        query: ${
          querySchema
            ? `parseRequestInput(${operation.operationId}QuerySchema, Object.fromEntries(request.nextUrl.searchParams.entries()), RequestInputType.QueryString)`
            : "undefined"
        },
        body: ${
          bodyParamSchema
            ? `parseRequestInput(${operation.operationId}BodySchema, await request.json(), RequestInputType.RequestBody)`
            : "undefined"
        }
       }

       const responder = {${[
         ...responseSchemas.specific.map((it) =>
           it.isWildCard
             ? `with${it.statusType}(status: ${it.statusType}) {return new KoaRuntimeResponse<${it.type}>(status) }`
             : `with${it.statusType}() {return new KoaRuntimeResponse<${it.type}>(${it.statusType}) }`,
         ),
         responseSchemas.defaultResponse &&
           `withDefault(status: StatusCode) { return new KoaRuntimeResponse<${responseSchemas.defaultResponse.type}>(status) }`,
         "withStatus(status: StatusCode) { return new KoaRuntimeResponse(status)}",
       ]
         .filter(Boolean)
         .join(",\n")}}

       const {
        status,
        body,
      } =  await import('@/${this.filename
        .replace("src/app", "lib")
        .replace(".ts", "")}')
                          .then(it => it.GET(input, responder, { request }))
                          .then(it => it.unpack())
                          .catch(err => { throw KoaRuntimeError.HandlerError(err) })

  return Response.json(body, {status})
  }`,
      }),
    )
  }

  toString(): string {
    const routes = this.statements
    const code = `
//region safe-edit-region-header
${this.existingRegions["header"] ?? ""}
//endregion safe-edit-region-header
${this.operationTypes.flatMap((it) => it.statements).join("\n\n")}

${routes.join("\n\n")}
`
    return code
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}

export class ServerBuilder implements ICompilable {
  constructor(
    public readonly filename: string,
    private readonly name: string,
    private readonly input: Input,
    private readonly imports: ImportBuilder = new ImportBuilder(),
  ) {
    // todo: unsure why, but adding an export at `.` of index.ts doesn't work properly
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
    const {name} = this

    return `
      export async function bootstrap(config: ServerConfig) {
        // ${name}
        return startServer(config)
      }
    `
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}

export async function generateTypescriptNextJS(
  config: OpenapiGeneratorConfig,
): Promise<void> {
  const input = config.input

  const routesDirectory = "./src/app/api"

  const rootTypeBuilder = await TypeBuilder.fromInput(
    "./src/lib/models.ts",
    input,
    config.compilerOptions,
  )

  const rootSchemaBuilder = await schemaBuilderFactory(
    "./src/lib/schemas.ts",
    input,
    config.schemaBuilder,
  )

  const server = new ServerBuilder(
    "./src/lib/index.ts",
    input.name(),
    input,
    new ImportBuilder(),
  )

  const routers = await Promise.all(
    input.groupedOperations("route").map(async (group) => {
      const filename = path.join(
        routesDirectory,
        routeToNextJSFilepath(group.name),
      )

      const imports = new ImportBuilder({filename})

      const routerBuilder = new ServerRouterBuilder(
        filename,
        group.name,
        input,
        imports,
        rootTypeBuilder.withImports(imports),
        rootSchemaBuilder.withImports(imports),
        loadExistingImplementations(
          await loadPreviousResult(config.dest, {filename}),
        ),
      )

      group.operations.forEach((it) => routerBuilder.add(it))

      return routerBuilder.toCompilationUnit()
    }),
  )

  await emitGenerationResult(
    config.dest,
    [
      server.toCompilationUnit(),
      ...routers,
      rootTypeBuilder.toCompilationUnit(),
      rootSchemaBuilder.toCompilationUnit(),
    ],
    {
      allowUnusedImports: config.allowUnusedImports,
    },
  )
}

function routeToNextJSFilepath(route: string): string {
  const parts = route
    .split("/")
    .map((part) => part.replaceAll("{", "[").replaceAll("}", "]"))

  parts.push("route.ts")

  return path.join(...parts)
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
        safeRegionName = match[1]!
      }
    } else if (safeRegionName) {
      buffer.push(line)
    }
  }

  return result
}
