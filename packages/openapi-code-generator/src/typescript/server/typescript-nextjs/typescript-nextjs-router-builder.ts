import type {Input} from "../../../core/input"
import {isDefined, titleCase} from "../../../core/utils"
import type {ImportBuilder} from "../../common/import-builder"
import type {SchemaBuilder} from "../../common/schema-builders/schema-builder"
import type {TypeBuilder} from "../../common/type-builder"
import {constStatement} from "../../common/type-utils"
import {buildExport} from "../../common/typescript-common"
import {AbstractRouterBuilder} from "../abstract-router-builder"
import type {
  ServerOperationBuilder,
  ServerSymbols,
} from "../server-operation-builder"

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

    const schemaBuilderType = this.schemaBuilder.type

    switch (schemaBuilderType) {
      case "joi": {
        this.imports
          .from("@nahkies/typescript-nextjs-runtime/joi")
          .add("parseRequestInput", "responseValidationFactory")
        break
      }
      case "zod-v3":
      case "zod-v4": {
        this.imports
          .from("@nahkies/typescript-nextjs-runtime/zod")
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
        value: `(implementation: ${symbols.implTypeName}, onError: (err: unknown) => Promise<Response>) => async (${["request: NextRequest", params.path.schema ? "{params}: {params: Promise<unknown>}" : undefined].filter(isDefined).join(",")}): Promise<Response> => {
try {
  const input = {
        params: ${
          params.path.schema
            ? `parseRequestInput(${params.path.name}, await params, RequestInputType.RouteParam)`
            : "undefined"
        },
        // TODO: this swallows repeated parameters
        query: ${
          params.query.schema
            ? `parseRequestInput(${params.query.name}, Object.fromEntries(request.nextUrl.searchParams.entries()), RequestInputType.QueryString)`
            : "undefined"
        },
        ${params.body.schema && !params.body.isSupported ? `// todo: request bodies with content-type '${params.body.contentType}' not yet supported\n` : ""}
        body: ${
          params.body.schema
            ? `parseRequestInput(${params.body.schema}, await request.json(), RequestInputType.RequestBody)${!params.body.isSupported ? " as never" : ""}`
            : "undefined"
        },
        headers: ${
          params.header.schema
            ? `parseRequestInput(${params.header.name}, Reflect.get(request, "headers"), RequestInputType.RequestHeader)`
            : "undefined"
        }
       }

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
