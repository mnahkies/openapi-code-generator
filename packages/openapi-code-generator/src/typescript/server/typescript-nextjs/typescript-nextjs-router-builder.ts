import type {Input} from "../../../core/input.ts"
import {isDefined, titleCase} from "../../../core/utils.ts"
import type {ImportBuilder} from "../../common/import-builder.ts"
import type {SchemaBuilder} from "../../common/schema-builders/schema-builder.ts"
import type {TypeBuilder} from "../../common/type-builder/type-builder.ts"
import {constStatement, object} from "../../common/type-utils.ts"
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

  // biome-ignore lint/complexity/noUselessConstructor: todo
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
      .add("OpenAPIRuntimeResponse", "parseQueryParameters")
      .addType(
        "OpenAPIRuntimeResponder",
        "Params",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
        "StatusCode",
      )

    this.imports.from("next/server").addType("NextRequest", "NextResponse")

    this.imports
      .from("@nahkies/typescript-nextjs-runtime/errors")
      .add("OpenAPIRuntimeError", "RequestInputType")

    const schemaBuilderType = this.schemaBuilder.type

    switch (schemaBuilderType) {
      case "joi": {
        this.imports
          .from("@nahkies/typescript-nextjs-runtime/joi")
          .add("parseRequestInput", "responseValidationFactory")
        break
      }
      case "zod-v3": {
        this.imports
          .from("@nahkies/typescript-nextjs-runtime/zod-v3")
          .add("parseRequestInput", "responseValidationFactory")
        break
      }
      case "zod-v4": {
        this.imports
          .from("@nahkies/typescript-nextjs-runtime/zod-v4")
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
          ? "Object.fromEntries(request.nextUrl.searchParams.entries())"
          : `parseQueryParameters(request.nextUrl.search, ${JSON.stringify(params.query.parameters)})`,
        type: "RequestInputType.QueryString",
      }),
      this.parseRequestInput("body", {
        name: params.body.schema,
        schema: params.body.schema,
        source:
          params.body.contentType === "application/octet-stream"
            ? "await request.blob()"
            : params.body.contentType === "application/x-www-form-urlencoded" ||
                params.body.contentType === "multipart/form-data"
              ? "await request.formData()"
              : "await request.json()",
        type: "RequestInputType.RequestBody",
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
       ${params.hasParams ? `const input = ${inputObject}` : ""}
       const responder = ${responder.implementation}
       const responseValidator = ${builder.responseValidator()}

       const res = await implementation(${[params.hasParams ? "input" : undefined, "responder", "request"].filter(isDefined).join(",")})
          .then(it => {
            if(it instanceof Response) {
              return it
            }
            const {status, body} = it.unpack()
            const validatedBody = responseValidator(status, body)

           return validatedBody !== undefined ? Response.json(validatedBody, {status}) : new Response(undefined, {status})
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
