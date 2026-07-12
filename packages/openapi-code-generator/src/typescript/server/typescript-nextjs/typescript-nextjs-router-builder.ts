import type {Input} from "../../../core/input.ts"
import {isDefined, titleCase} from "../../../core/utils.ts"
import type {ImportBuilder} from "../../common/import-builder.ts"
import {JoiBuilder} from "../../common/schema-builders/joi-schema-builder.ts"
import type {SchemaBuilder} from "../../common/schema-builders/schema-builder.ts"
import {ZodV3Builder as ZodBuilder} from "../../common/schema-builders/zod-v3-schema-builder.ts"
import type {TypeBuilder} from "../../common/type-builder/type-builder.ts"
import {
  constStatement,
  object,
  quotedStringLiteral,
} from "../../common/type-utils.ts"
import {buildExport} from "../../common/typescript-common.ts"
import {AbstractRouterBuilder} from "../abstract-router-builder.ts"
import type {
  ServerOperationBuilder,
  ServerSymbols,
} from "../server-operation-builder.ts"

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

    const inputObject = object([
      this.parseRequestInput("params", {
        name: params.path.name,
        schema: params.path.schema,
        source: "await params",
        type: "RequestInputType.RouteParam",
      }),
      this.parseRequestInput("query", {
        name: params.query.name,
        schema: params.query.schema,
        source: params.query.isSimpleQuery
          ? `Object.fromEntries(request.nextUrl.searchParams.entries()), RequestInputType.QueryString)`
          : `parseQueryParameters(ctx.querystring, ${JSON.stringify(params.query.parameters)})`,
        type: "RequestInputType.QueryString",
      }),
      this.parseRequestInput("body", {
        name: params.body.schema,
        schema: params.body.schema,
        source: "await request.json()",
        type: `RequestInputType.RequestBody`,
        comment:
          params.body.schema && !params.body.isSupported
            ? `// todo: request bodies with content-type '${params.body.contentType}' not yet supported`
            : "",
      }) + (params.body.schema && !params.body.isSupported ? " as never" : ""),
      this.parseRequestInput("headers", {
        name: params.header.name,
        schema: params.header.schema,
        source: 'Reflect.get(request, "headers")',
        type: "RequestInputType.RequestHeader",
      }),
    ])

    statements.push(
      buildExport({
        name: `_${builder.method.toUpperCase()}`,
        kind: "const",
        value: `(implementation: ${symbols.implTypeName}, onError: (err: unknown) => Promise<Response>) => async (${["request: NextRequest", params.path.schema ? "{params}: {params: Promise<unknown>}" : undefined].filter(isDefined).join(",")}): Promise<Response> => {
try {
       const input = ${inputObject}
       const responder = ${responder.implementation}

       const res = await implementation(${[params.hasParams ? "input" : undefined, "responder", "request"].filter(isDefined).join(",")})
          .then(it => {
            if(it instanceof Response) {
              return it
            }
            const {status, body} = it.unpack()

           return body !== undefined ? Response.json(body, {status}) : new Response(undefined, {status})
          })
          .catch(err => { throw OpenAPIRuntimeError.HandlerError(err) })

    return res
  } catch (err) {
    return await onError(err)
  }
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
