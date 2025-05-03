import type {Input} from "../../../core/input"
import {isDefined, titleCase} from "../../../core/utils"
import type {ServerImplementationMethod} from "../../../templates.types"
import type {ImportBuilder} from "../../common/import-builder"
import {JoiBuilder} from "../../common/schema-builders/joi-schema-builder"
import type {SchemaBuilder} from "../../common/schema-builders/schema-builder"
import {ZodBuilder} from "../../common/schema-builders/zod-schema-builder"
import type {TypeBuilder} from "../../common/type-builder"
import {constStatement, object} from "../../common/type-utils"
import {buildExport} from "../../common/typescript-common"
import {
  AbstractRouterBuilder,
  type ServerSymbols,
} from "../abstract-router-builder"
import type {ServerOperationBuilder} from "../server-operation-builder"

export class KoaRouterBuilder extends AbstractRouterBuilder {
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
        "r",
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

  protected buildOperation(builder: ServerOperationBuilder): string {
    const statements: string[] = []

    const symbols = this.operationSymbols(builder.operationId)
    const params = builder.parameters(symbols)

    if (params.path.schema) {
      statements.push(constStatement(symbols.paramSchema, params.path.schema))
    }
    if (params.query.schema) {
      statements.push(constStatement(symbols.querySchema, params.query.schema))
    }
    if (params.header.schema) {
      statements.push(
        constStatement(symbols.requestHeaderSchema, params.header.schema),
      )
    }
    if (params.body.schema) {
      statements.push(
        constStatement(symbols.requestBodySchema, params.body.schema),
      )
    }

    const responseSchemas = builder.responseSchemas()
    const responder = builder.responder()

    this.operationTypes.push({
      operationId: builder.operationId,
      statements: [
        `const ${symbols.responderName} = ${responder.implementation}`,
        `type ${titleCase(symbols.responderName)} = typeof ${symbols.responderName} & KoaRuntimeResponder`,
        `const ${symbols.responseBodyValidator} = ${builder.responseValidator()}`,
        buildExport({
          name: symbols.implTypeName,
          value: `(
                    params: ${params.type},
                    respond: ${titleCase(symbols.responderName)},
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

    statements.push(`
router.${builder.method.toLowerCase()}('${symbols.implPropName}','${route(builder.route)}', async (ctx, next) => {
   const input = {
    params: ${params.path.schema ? `parseRequestInput(${symbols.paramSchema}, ctx.params, RequestInputType.RouteParam)` : "undefined"},
    query: ${params.query.schema ? `parseRequestInput(${symbols.querySchema}, ctx.query, RequestInputType.QueryString)` : "undefined"},
    body: ${params.body.schema ? `parseRequestInput(${symbols.requestBodySchema}, Reflect.get(ctx.request, "body"), RequestInputType.RequestBody)` : "undefined"},
    headers: ${params.header.schema ? `parseRequestInput(${symbols.requestHeaderSchema}, Reflect.get(ctx.request, "headers"), RequestInputType.RequestHeader)` : "undefined"}
   }

   const response = await implementation.${symbols.implPropName}(input, ${symbols.responderName}, ctx)
    .catch(err => { throw KoaRuntimeError.HandlerError(err) })

   const { status, body } = response instanceof KoaRuntimeResponse ? response.unpack() : response

   ctx.body = ${symbols.responseBodyValidator}(status, body)
   ctx.status = status
   return next();
})`)

    return statements.join("\n\n")
  }

  protected operationSymbols(operationId: string): ServerSymbols {
    return {
      implPropName: operationId,
      implTypeName: titleCase(operationId),
      responderName: `${operationId}Responder`,
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
              .map((it) => this.operationSymbols(it.operationId))
              .map((it) => `${it.implPropName}: ${it.implTypeName}`)
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
              .map((it) => this.operationSymbols(it.operationId))
              .map((it) => `abstract ${it.implPropName}: ${it.implTypeName}`)
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

  protected buildRouter(
    routerName: string,
    routerStatements: string[],
  ): string {
    const moduleName = titleCase(routerName)
    const implementationExportName = `${moduleName}Implementation`
    const createRouterExportName = `create${moduleName}Router`

    return `
${this.operationTypes.flatMap((it) => it.statements).join("\n\n")}

${this.implementationExport(implementationExportName)}

export function ${createRouterExportName}(implementation: ${implementationExportName}): KoaRouter {
  const router = new KoaRouter()

  ${routerStatements.join("\n\n")}

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

function route(route: string): string {
  const placeholder = /{([^{}]+)}/g

  return Array.from(route.matchAll(placeholder)).reduce((result, match) => {
    return result.replace(match[0], `:${match[1]}`)
  }, route)
}
