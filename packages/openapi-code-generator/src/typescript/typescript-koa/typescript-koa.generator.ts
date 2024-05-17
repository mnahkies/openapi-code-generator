import path from "path"
import {Input} from "../../core/input"
import {
  IRModelObject,
  IROperation,
  IRParameter,
} from "../../core/openapi-types-normalized"
import {isDefined, titleCase, upperFirst} from "../../core/utils"
import {OpenapiGeneratorConfig} from "../../templates.types"
import {CompilationUnit, ICompilable} from "../common/compilation-units"
import {ImportBuilder} from "../common/import-builder"
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

    this.imports
      .from("@nahkies/typescript-koa-runtime/errors")
      .add("KoaRuntimeError", "RequestInputType")

    this.imports.addModule("KoaRouter", "@koa/router")
    this.imports.from("@koa/router").add("RouterContext")

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
          upperFirst(name),
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
          upperFirst(name),
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
          upperFirst(name),
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
                    ctx: RouterContext
                  ) => Promise<KoaRuntimeResponse<unknown> | ${[
                    ...responseSchemas.specific.map(
                      (it) => `Response<${it.statusType}, ${it.type}>`,
                    ),
                    responseSchemas.defaultResponse &&
                      `Response<StatusCode, ${responseSchemas.defaultResponse.type}>`,
                  ]
                    .filter(isDefined)
                    .join(" | ")}>`,
          kind: "type",
        }),
      ],
    })

    this.statements.push(
      [
        `const ${
          operation.operationId
        }ResponseValidator = responseValidationFactory([${responseSchemas.specific.map(
          (it) => `["${it.statusString}", ${it.schema}]`,
        )}
      ], ${responseSchemas.defaultResponse?.schema})`,
        "",
        `router.${operation.method.toLowerCase()}('${
          operation.operationId
        }','${route(operation.route)}',`,
        `async (ctx, next) => {

       const input = {
        params: ${
          paramSchema
            ? `parseRequestInput(${operation.operationId}ParamSchema, ctx.params, RequestInputType.RouteParam)`
            : "undefined"
        },
        query: ${
          querySchema
            ? `parseRequestInput(${operation.operationId}QuerySchema, ctx.query, RequestInputType.QueryString)`
            : "undefined"
        },
        body: ${
          bodyParamSchema
            ? `parseRequestInput(${operation.operationId}BodySchema, Reflect.get(ctx.request, "body"), RequestInputType.RequestBody)`
            : "undefined"
        },
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

      const response = await implementation.${operation.operationId}(input, responder, ctx)
        .catch(err => { throw KoaRuntimeError.HandlerError(err) })


      const {
        status,
        body,
      } = response instanceof KoaRuntimeResponse ? response.unpack() : response

        ctx.body = ${operation.operationId}ResponseValidator(status, body)
        ctx.status = status
        return next();
      })`,
      ]
        .filter(isDefined)
        .join("\n"),
    )
  }

  toString(): string {
    const routes = this.statements
    const code = `
${this.operationTypes.flatMap((it) => it.statements).join("\n\n")}

${buildExport({
  name: "Implementation",
  value: object(
    this.operationTypes
      .map((it) => it.operationId)
      .map((key) => `${key}: ${titleCase(key)}`)
      .join(","),
  ),
  kind: "type",
})}

export function createRouter(implementation: Implementation): KoaRouter {
  const router = new KoaRouter()

  ${routes.join("\n\n")}

  return router
}
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

function route(route: string): string {
  const placeholder = /{([^{}]+)}/g

  return Array.from(route.matchAll(placeholder)).reduce((result, match) => {
    return result.replace(match[0], ":" + match[1])
  }, route)
}

export async function generateTypescriptKoa(
  config: OpenapiGeneratorConfig,
): Promise<void> {
  const {input, emitter} = config

  const routesDirectory =
    config.groupingStrategy === "none" ? "./" : "./routes/"

  const rootTypeBuilder = await TypeBuilder.fromInput(
    "./models.ts",
    input,
    config.compilerOptions,
  )

  const rootSchemaBuilder = await schemaBuilderFactory(
    "./schemas.ts",
    input,
    config.schemaBuilder,
  )

  const server = new ServerBuilder(
    "index.ts",
    input.name(),
    input,
    new ImportBuilder(),
  )

  const routers = await Promise.all(
    input.groupedOperations(config.groupingStrategy).map(async (group) => {
      const filename = path.join(routesDirectory, `${group.name}.ts`)

      const imports = new ImportBuilder({filename})

      const routerBuilder = new ServerRouterBuilder(
        filename,
        group.name,
        input,
        imports,
        rootTypeBuilder.withImports(imports),
        rootSchemaBuilder.withImports(imports),
      )

      group.operations.forEach((it) => routerBuilder.add(it))

      return routerBuilder.toCompilationUnit()
    }),
  )

  if (config.groupingStrategy === "none") {
    await emitter.emitGenerationResult([
      CompilationUnit.merge(
        "./generated.ts",
        ...routers,
        server.toCompilationUnit(),
      ),
      rootTypeBuilder.toCompilationUnit(),
      rootSchemaBuilder.toCompilationUnit(),
    ])
  } else {
    await emitter.emitGenerationResult([
      server.toCompilationUnit(),
      ...routers,
      rootTypeBuilder.toCompilationUnit(),
      rootSchemaBuilder.toCompilationUnit(),
    ])
  }
}
