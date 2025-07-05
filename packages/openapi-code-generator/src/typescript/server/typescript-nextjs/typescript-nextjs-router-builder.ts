import type {Input} from "../../../core/input"
import {isDefined, titleCase} from "../../../core/utils"
import type {ImportBuilder} from "../../common/import-builder"
import {JoiBuilder} from "../../common/schema-builders/joi-schema-builder"
import type {SchemaBuilder} from "../../common/schema-builders/schema-builder"
import {ZodBuilder} from "../../common/schema-builders/zod-schema-builder"
import type {TypeBuilder} from "../../common/type-builder"
import {constStatement} from "../../common/type-utils"
import {buildExport} from "../../common/typescript-common"
import {
  AbstractRouterBuilder,
  type ServerSymbols,
} from "../abstract-router-builder"
import type {ServerOperationBuilder} from "../server-operation-builder"

export class TypescriptNextjsRouterBuilder extends AbstractRouterBuilder {
  private readonly operationTypes: {
    operationId: string
    statements: string[]
  }[] = []

  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor(
    filename: string,
    name: string,
    input: Input,
    imports: ImportBuilder,
    types: TypeBuilder,
    schemaBuilder: SchemaBuilder,
  ) {
    super(filename, name, input, imports, types, schemaBuilder)
  }

  protected buildImports(): void {
    this.imports
      .from("@nahkies/typescript-nextjs-runtime/server")
      .add(
        "OpenAPIRuntimeResponse",
        "OpenAPIRuntimeResponder",
        "Params",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
        "StatusCode",
      )

    this.imports.from("next/server").add("NextRequest", "NextResponse")

    this.imports
      .from("@nahkies/typescript-nextjs-runtime/errors")
      .add("OpenAPIRuntimeError", "RequestInputType")

    if (this.schemaBuilder instanceof ZodBuilder) {
      this.imports
        .from("@nahkies/typescript-nextjs-runtime/zod")
        .add("parseRequestInput", "responseValidationFactory")
    } else if (this.schemaBuilder instanceof JoiBuilder) {
      this.imports
        .from("@nahkies/typescript-nextjs-runtime/joi")
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
    const responder = builder.responder(
      "OpenAPIRuntimeResponder",
      "OpenAPIRuntimeResponse",
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
          value: `(${[
            params.hasParams ? `params: ${params.type}` : undefined,
            `respond: ${symbols.responderName}`,
            "request: NextRequest",
          ]
            .filter(isDefined)
            .join(",")}) => Promise<OpenAPIRuntimeResponse<unknown>>`,
          kind: "type",
        }),
      ],
    })

    statements.push(
      buildExport({
        name: `_${builder.method.toUpperCase()}`,
        kind: "const",
        value: `(implementation: ${symbols.implTypeName}) => async (${["request: NextRequest", params.path.schema ? "{params}: {params: Promise<unknown>}" : undefined].filter(isDefined).join(",")}): Promise<Response> => {
  const input = {
        params: ${
          params.path.schema
            ? `parseRequestInput(${symbols.paramSchema}, await params, RequestInputType.RouteParam)`
            : "undefined"
        },
        // TODO: this swallows repeated parameters
        query: ${
          params.query.schema
            ? `parseRequestInput(${symbols.querySchema}, Object.fromEntries(request.nextUrl.searchParams.entries()), RequestInputType.QueryString)`
            : "undefined"
        },
        body: ${
          params.body.schema
            ? `parseRequestInput(${symbols.requestBodySchema}, await request.json(), RequestInputType.RequestBody)`
            : "undefined"
        },
        headers: ${
          params.header.schema
            ? `parseRequestInput(${symbols.requestHeaderSchema}, Reflect.get(request, "headers"), RequestInputType.RequestHeader)`
            : "undefined"
        }
       }

       const responder = ${responder.implementation}

       const {
        status,
        body,
      } = await implementation(${[params.hasParams ? "input" : undefined, "responder", "request"].filter(isDefined).join(",")})
          .then(it => it.unpack())
          .catch(err => { throw OpenAPIRuntimeError.HandlerError(err) })

  return body !== undefined ? Response.json(body, {status}) : new Response(undefined, {status})
  }`,
      }),
    )

    return statements.join("\n\n")
  }

  protected operationSymbols(operationId: string): ServerSymbols {
    return {
      implPropName: operationId,
      implTypeName: titleCase(operationId),
      responderName: `${titleCase(operationId)}Responder`,
      paramSchema: `${operationId}ParamSchema`,
      querySchema: `${operationId}QuerySchema`,
      requestBodySchema: `${operationId}BodySchema`,
      requestHeaderSchema: `${operationId}HeaderSchema`,
      responseBodyValidator: `${operationId}ResponseValidator`,
    }
  }

  protected buildRouter(
    routerName: string,
    routerStatements: string[],
  ): string {
    return `
// ${routerName}
${this.operationTypes.flatMap((it) => it.statements).join("\n\n")}

${routerStatements.join("\n\n")}
`
  }
}
