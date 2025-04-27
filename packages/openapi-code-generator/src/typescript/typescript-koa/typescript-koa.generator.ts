// biome-ignore lint/style/useNodejsImportProtocol: keep webpack happy
import path from "path"
import type {Input} from "../../core/input"
import {isDefined, normalizeFilename, titleCase} from "../../core/utils"
import type {
  OpenapiTypescriptGeneratorConfig,
  ServerImplementationMethod,
} from "../../templates.types"
import {AbstractServerRouterBuilder} from "../common/abstract-server-router-builder"
import {CompilationUnit, type ICompilable} from "../common/compilation-units"
import {ImportBuilder} from "../common/import-builder"
import {JoiBuilder} from "../common/schema-builders/joi-schema-builder"
import {
  type SchemaBuilder,
  schemaBuilderFactory,
} from "../common/schema-builders/schema-builder"
import {ZodBuilder} from "../common/schema-builders/zod-schema-builder"
import type {ServerOperationBuilder} from "../common/server-operation-builder"
import {TypeBuilder} from "../common/type-builder"
import {intersect, object} from "../common/type-utils"
import {buildExport} from "../common/typescript-common"

export type ServerSymbols = {
  implPropName: string
  typeName: string
  responderName: string
  paramSchema: string
  querySchema: string
  requestBodySchema: string
  requestHeaderSchema: string
  responseBodyValidator: string
}

export class KoaServerRouterBuilder extends AbstractServerRouterBuilder {
  private readonly statements: string[] = []
  private readonly operationTypes: {
    operationId: string
    statements: string[]
  }[] = []

  constructor(
    filename: string,
    name: string,
    input: Input,
    imports: ImportBuilder,
    types: TypeBuilder,
    schemaBuilder: SchemaBuilder,
    private readonly implementationMethod: ServerImplementationMethod,
  ) {
    super(filename, name, input, imports, types, schemaBuilder)
  }

  protected buildImports(): void {
    // todo: unsure why, but adding an export at `.` of index.ts doesn't work properly
    this.imports
      .from("@nahkies/typescript-koa-runtime/server")
      .add(
        "KoaRuntimeResponder",
        "KoaRuntimeResponse",
        "Params",
        "Response",
        "ServerConfig",
        "StatusCode",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
        "startServer",
      )

    this.imports
      .from("@nahkies/typescript-koa-runtime/errors")
      .add("KoaRuntimeError", "RequestInputType")

    this.imports.addModule("KoaRouter", "@koa/router")
    this.imports.from("@koa/router").add("RouterContext")

    if (this.schemaBuilder instanceof ZodBuilder) {
      this.imports
        .from("@nahkies/typescript-koa-runtime/zod")
        .add("parseRequestInput", "responseValidationFactory")
    } else if (this.schemaBuilder instanceof JoiBuilder) {
      this.imports
        .from("@nahkies/typescript-koa-runtime/joi")
        .add("parseRequestInput", "responseValidationFactory")
    }
  }

  private addParameterSchemaStatement(symbolName: string, schema: string) {
    this.statements.push(`const ${symbolName} = ${schema}`)
  }

  protected buildOperation(builder: ServerOperationBuilder): void {
    const symbols = this.operationSymbolNames(builder.operationId)
    const params = builder.parameters(symbols)

    if (params.path.schema) {
      this.addParameterSchemaStatement(symbols.paramSchema, params.path.schema)
    }
    if (params.query.schema) {
      this.addParameterSchemaStatement(symbols.querySchema, params.query.schema)
    }
    if (params.header.schema) {
      this.addParameterSchemaStatement(
        symbols.requestHeaderSchema,
        params.header.schema,
      )
    }
    if (params.body.schema) {
      this.addParameterSchemaStatement(
        symbols.requestBodySchema,
        params.body.schema,
      )
    }

    const responseSchemas = builder.responseSchemas()
    const responder = builder.responder()

    this.operationTypes.push({
      operationId: builder.operationId,
      statements: [
        buildExport({
          name: symbols.responderName,
          value: responder.type,
          kind: "type",
        }),
        buildExport({
          name: symbols.typeName,
          value: `(
                    params: ${params.type},
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

    this.statements.push(`
const ${symbols.responseBodyValidator} = ${builder.responseValidator()}

router.${builder.method.toLowerCase()}('${symbols.implPropName}','${route(builder.route)}', async (ctx, next) => {
   const input = {
    params: ${params.path.schema ? `parseRequestInput(${symbols.paramSchema}, ctx.params, RequestInputType.RouteParam)` : "undefined"},
    query: ${params.query.schema ? `parseRequestInput(${symbols.querySchema}, ctx.query, RequestInputType.QueryString)` : "undefined"},
    body: ${params.body.schema ? `parseRequestInput(${symbols.requestBodySchema}, Reflect.get(ctx.request, "body"), RequestInputType.RequestBody)` : "undefined"},
    headers: ${params.header.schema ? `parseRequestInput(${symbols.requestHeaderSchema}, Reflect.get(ctx.request, "headers"), RequestInputType.RequestHeader)` : "undefined"}
   }

   const responder = ${responder.implementation}

   const response = await implementation.${symbols.implPropName}(input, responder, ctx)
    .catch(err => { throw KoaRuntimeError.HandlerError(err) })

   const { status, body } = response instanceof KoaRuntimeResponse ? response.unpack() : response

   ctx.body = ${symbols.responseBodyValidator}(status, body)
   ctx.status = status
   return next();
})`)
  }

  private operationSymbolNames(operationId: string): ServerSymbols {
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

  protected buildRouter(routerName: string): string {
    const moduleName = titleCase(routerName)
    const implementationExportName = `${moduleName}Implementation`
    const createRouterExportName = `create${moduleName}Router`

    return `
${this.operationTypes.flatMap((it) => it.statements).join("\n\n")}

${this.implementationExport(implementationExportName)}

export function ${createRouterExportName}(implementation: ${implementationExportName}): KoaRouter {
  const router = new KoaRouter()

  ${this.statements.join("\n\n")}

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
  }
}

export class KoaServerBuilder implements ICompilable {
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

  const server = new KoaServerBuilder(
    "index.ts",
    input.name(),
    input,
    new ImportBuilder(),
  )

  const routers = await Promise.all(
    input.groupedOperations(config.groupingStrategy).map(async (group) => {
      const filename = normalizeFilename(
        `${path.join(routesDirectory, group.name)}.ts`,
        config.filenameConvention,
      )
      const imports = new ImportBuilder({filename})

      const routerBuilder = new KoaServerRouterBuilder(
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
