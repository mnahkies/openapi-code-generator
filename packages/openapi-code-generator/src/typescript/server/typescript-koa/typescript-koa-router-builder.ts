import type {Input} from "../../../core/input"
import {isDefined, titleCase} from "../../../core/utils"
import type {ServerImplementationMethod} from "../../../templates.types"
import type {ImportBuilder} from "../../common/import-builder"
import type {SchemaBuilder} from "../../common/schema-builders/schema-builder"
import type {TypeBuilder} from "../../common/type-builder"
import {constStatement, object} from "../../common/type-utils"
import {buildExport} from "../../common/typescript-common"
import {AbstractRouterBuilder} from "../abstract-router-builder"
import type {
  ServerOperationBuilder,
  ServerSymbols,
} from "../server-operation-builder"

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
    this.imports
      .from("@nahkies/typescript-koa-runtime/server")
      .add(
        "KoaRuntimeResponse",
        "SkipResponse",
        "startServer",
        "parseQueryParameters",
      )
      .addType(
        "KoaRuntimeResponder",
        "Params",
        "Res",
        "StatusCode",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
      )

    this.imports
      .from("@nahkies/typescript-koa-runtime/errors")
      .add("KoaRuntimeError", "RequestInputType")

    this.imports.from("koa").addType("Next")
    this.imports.from("@koa/router").addType("RouterContext").all("KoaRouter")

    const schemaBuilderType = this.schemaBuilder.type

    switch (schemaBuilderType) {
      case "joi": {
        this.imports
          .from("@nahkies/typescript-koa-runtime/joi")
          .add("parseRequestInput", "responseValidationFactory")
        break
      }
      case "zod-v3": {
        this.imports
          .from("@nahkies/typescript-koa-runtime/zod-v3")
          .add("parseRequestInput", "responseValidationFactory")
        break
      }
      case "zod-v4": {
        this.imports
          .from("@nahkies/typescript-koa-runtime/zod-v4")
          .add("parseRequestInput", "responseValidationFactory")
        break
      }
      default: {
        throw new Error(
          `unsupported schema builder type '${schemaBuilderType satisfies never}'`,
        )
      }
    }
  }

  protected buildOperation(builder: ServerOperationBuilder): string {
    const statements: string[] = []

    const symbols = this.operationSymbols(builder.operationId)
    const params = builder.parameters()

    if (params.path.schema) {
      statements.push(constStatement(params.path.name, params.path.schema))
    }

    if (params.query.schema) {
      statements.push(constStatement(params.query.name, params.query.schema))
    }

    if (params.header.schema) {
      statements.push(constStatement(params.header.name, params.header.schema))
    }

    const responseSchemas = builder.responseSchemas()
    const responder = builder.responder(
      "KoaRuntimeResponder",
      "KoaRuntimeResponse",
    )

    this.operationTypes.push({
      operationId: builder.operationId,
      statements: [
        buildExport({
          name: symbols.responderName,
          value: responder.type,
          kind: "type",
        }),
        buildExport({
          name: symbols.implTypeName,
          value: `(
                    params: ${params.type},
                    respond: ${symbols.responderName},
                    ctx: RouterContext,
                    next: Next
                  ) => Promise<KoaRuntimeResponse<unknown> | ${[
                    ...responseSchemas.specific.map(
                      (it) => `Res<${it.statusType}, ${it.type}>`,
                    ),
                    responseSchemas.defaultResponse &&
                      `Res<StatusCode, ${responseSchemas.defaultResponse.type}>`,
                    "typeof SkipResponse",
                  ]
                    .filter(isDefined)
                    .join(" | ")}>`,
          kind: "type",
        }),
      ],
    })

    statements.push(`
const ${symbols.responseBodyValidator} = ${builder.responseValidator()}

router.${builder.method.toLowerCase()}('${symbols.implPropName}','${builder.route}', async (ctx, next) => {
   const input = {
    params: ${params.path.schema ? `parseRequestInput(${params.path.name}, ctx.params, RequestInputType.RouteParam)` : "undefined"},
    query: ${params.query.schema ? `parseRequestInput(${params.query.name}, ${params.query.isSimpleQuery ? "ctx.query" : `parseQueryParameters(ctx.querystring, ${JSON.stringify(params.query.parameters)})`}, RequestInputType.QueryString)` : "undefined"},
    ${params.body.schema && !params.body.isSupported ? `// todo: request bodies with content-type '${params.body.contentType}' not yet supported\n` : ""}body: ${params.body.schema ? `parseRequestInput(${params.body.schema}, Reflect.get(ctx.request, "body"), RequestInputType.RequestBody)${!params.body.isSupported ? " as never" : ""}` : "undefined"},
    headers: ${params.header.schema ? `parseRequestInput(${params.header.name}, Reflect.get(ctx.request, "headers"), RequestInputType.RequestHeader)` : "undefined"}
   }

   const responder = ${responder.implementation}

   const response = await implementation.${symbols.implPropName}(input, responder, ctx, next)
    .catch(err => { throw KoaRuntimeError.HandlerError(err) })

   // escape hatch to allow responses to be sent by the implementation handler
   if(response === SkipResponse) {
    return
   }

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
      responderName: `${titleCase(operationId)}Responder`,
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
