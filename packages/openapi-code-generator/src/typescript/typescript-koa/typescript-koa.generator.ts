import path from "node:path"
import type {Input} from "../../core/input"
import type {
  IRModelObject,
  IROperation,
  IRParameter,
} from "../../core/openapi-types-normalized"
import {isDefined, titleCase, upperFirst} from "../../core/utils"
import type {
  OpenapiTypescriptGeneratorConfig,
  ServerImplementationMethod,
} from "../../templates.types"
import {CompilationUnit, type ICompilable} from "../common/compilation-units"
import {ImportBuilder} from "../common/import-builder"
import {JoiBuilder} from "../common/schema-builders/joi-schema-builder"
import {
  type SchemaBuilder,
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
    (model, parameter) => {
      model.properties[parameter.name] = parameter.schema

      if (parameter.required) {
        model.required.push(parameter.name)
      }

      return model
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
    private readonly implementationMethod: ServerImplementationMethod,
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
    const symbols = this.operationSymbolNames(operation.operationId)
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

    const headerParams = operation.parameters
      .filter((it) => it.in === "header")
      .map((it) => ({...it, name: it.name.toLowerCase()}))
    const headerSchema = headerParams.length
      ? schemaBuilder.fromParameters(headerParams)
      : undefined

    let headerParamsType = "void"

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
      pathParamsType = types.schemaObjectToType(
        this.input.loader.addVirtualType(
          operation.operationId,
          upperFirst(symbols.paramSchema),
          reduceParamsToOpenApiSchema(pathParams),
        ),
      )
      this.statements.push(
        `const ${symbols.paramSchema} = ${paramSchema.toString()}`,
      )
    }

    if (querySchema) {
      queryParamsType = types.schemaObjectToType(
        this.input.loader.addVirtualType(
          operation.operationId,
          upperFirst(symbols.querySchema),
          reduceParamsToOpenApiSchema(queryParams),
        ),
      )
      this.statements.push(
        `const ${symbols.querySchema} = ${querySchema.toString()}`,
      )
    }

    if (headerSchema) {
      headerParamsType = types.schemaObjectToType(
        this.input.loader.addVirtualType(
          operation.operationId,
          upperFirst(symbols.requestHeaderSchema),
          reduceParamsToOpenApiSchema(headerParams),
        ),
      )
      this.statements.push(
        `const ${symbols.requestHeaderSchema} = ${headerSchema.toString()}`,
      )
    }

    if (bodyParamSchema && requestBodyParameter) {
      bodyParamsType = types.schemaObjectToType(
        this.input.loader.addVirtualType(
          operation.operationId,
          upperFirst(symbols.requestBodySchema),
          this.input.schema(requestBodyParameter.schema),
        ),
      )
      this.statements.push(
        `const ${symbols.requestBodySchema} = ${bodyParamSchema}`,
      )
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
          name: symbols.responderName,
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
          name: symbols.typeName,
          value: `(
                    params: Params<
                      ${pathParamsType},
                      ${queryParamsType},
                      ${
                        bodyParamsType +
                        (bodyParamsType === "void" || bodyParamIsRequired
                          ? ""
                          : " | undefined")
                      },
                      ${headerParamsType}>,
                    respond: ${symbols.responderName},
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
        `const ${symbols.responseBodyValidator} = responseValidationFactory([${responseSchemas.specific.map(
          (it) => `["${it.statusString}", ${it.schema}]`,
        )}
      ], ${responseSchemas.defaultResponse?.schema})`,
        "",
        `router.${operation.method.toLowerCase()}('${
          symbols.implPropName
        }','${route(operation.route)}',`,
        `async (ctx, next) => {

       const input = {
        params: ${
          paramSchema
            ? `parseRequestInput(${symbols.paramSchema}, ctx.params, RequestInputType.RouteParam)`
            : "undefined"
        },
        query: ${
          querySchema
            ? `parseRequestInput(${symbols.querySchema}, ctx.query, RequestInputType.QueryString)`
            : "undefined"
        },
        body: ${
          bodyParamSchema
            ? `parseRequestInput(${symbols.requestBodySchema}, Reflect.get(ctx.request, "body"), RequestInputType.RequestBody)`
            : "undefined"
        },
        headers: ${
          headerSchema
            ? `parseRequestInput(${symbols.requestHeaderSchema}, Reflect.get(ctx.request, "headers"), RequestInputType.RequestHeader)`
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

      const response = await implementation.${symbols.implPropName}(input, responder, ctx)
        .catch(err => { throw KoaRuntimeError.HandlerError(err) })


      const {
        status,
        body,
      } = response instanceof KoaRuntimeResponse ? response.unpack() : response

        ctx.body = ${symbols.responseBodyValidator}(status, body)
        ctx.status = status
        return next();
      })`,
      ]
        .filter(isDefined)
        .join("\n"),
    )
  }

  private operationSymbolNames(operationId: string) {
    return {
      implPropName: operationId,
      typeName: titleCase(operationId),
      responderName: `${titleCase(operationId)}Responder`,
      paramSchema: `${operationId}ParamSchema`,
      querySchema: `${operationId}QuerySchema`,
      requestBodySchema: `${operationId}BodySchema`,
      requestHeaderSchema: `${operationId}HeaderSchema`,
      responseBodyValidator: `${operationId}ResponseValidator`,
    }
  }

  implementationExport(name: string): string {
    switch (this.implementationMethod) {
      case "type":
      case "interface": {
        return buildExport({
          name,
          value: object(
            this.operationTypes
              .map((it) => this.operationSymbolNames(it.operationId))
              .map((it) => `${it.implPropName}: ${it.typeName}`)
              .join(","),
          ),
          kind: this.implementationMethod,
        })
      }

      case "abstract-class": {
        return buildExport({
          name,
          value: object(
            this.operationTypes
              .map((it) => this.operationSymbolNames(it.operationId))
              .map((it) => `abstract ${it.implPropName}: ${it.typeName}`)
              .join("\n"),
          ),
          kind: "abstract-class",
        })
      }

      default: {
        throw new Error(
          `server implementation method '${this.implementationMethod}' is not supported`,
        )
      }
    }
  }

  toString(): string {
    const moduleName = titleCase(this.name)

    const implementationExportName = `${moduleName}Implementation`
    const createRouterExportName = `create${moduleName}Router`

    const routes = this.statements
    const code = `
${this.operationTypes.flatMap((it) => it.statements).join("\n\n")}

${this.implementationExport(implementationExportName)}

export function ${createRouterExportName}(implementation: ${implementationExportName}): KoaRouter {
  const router = new KoaRouter()

  ${routes.join("\n\n")}

  return router
}

${
  moduleName &&
  `
export {${createRouterExportName} as createRouter}
export ${this.implementationMethod === "type" || this.implementationMethod === "interface" ? "type" : ""} {${implementationExportName} as Implementation}
`
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
    return result.replace(match[0], `:${match[1]}`)
  }, route)
}

export async function generateTypescriptKoa(
  config: OpenapiTypescriptGeneratorConfig,
): Promise<void> {
  const {input, emitter, allowAny} = config

  const routesDirectory =
    config.groupingStrategy === "none" ? "./" : "./routes/"

  const rootTypeBuilder = await TypeBuilder.fromInput(
    "./models.ts",
    input,
    config.compilerOptions,
    {allowAny},
  )

  const rootSchemaBuilder = await schemaBuilderFactory(
    "./schemas.ts",
    input,
    config.schemaBuilder,
    {allowAny},
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
        config.serverImplementationMethod,
      )

      // biome-ignore lint/complexity/noForEach: <explanation>
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
