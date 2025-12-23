import type {Input} from "../../../core/input"
import {titleCase} from "../../../core/utils"
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

export class ExpressRouterBuilder extends AbstractRouterBuilder {
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
      .from("express")
      .add("Router")
      .addType("Request", "Response", "NextFunction")

    this.imports.from("express").all("express")

    this.imports
      .from("@nahkies/typescript-express-runtime/server")
      .add(
        "ExpressRuntimeResponse",
        "parseQueryParameters",
        "handleResponse",
        "handleImplementationError",
        "parseOctetStream",
      )
      .addType(
        "ExpressRuntimeResponder",
        "Params",
        "StatusCode",
        "StatusCode1xx",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
        "SkipResponse",
      )

    this.imports
      .from("@nahkies/typescript-express-runtime/errors")
      .add("ExpressRuntimeError", "RequestInputType")

    const schemaBuilderType = this.schemaBuilder.type

    switch (schemaBuilderType) {
      case "joi": {
        this.imports
          .from("@nahkies/typescript-express-runtime/joi")
          .add("parseRequestInput", "responseValidationFactory")
        break
      }
      case "zod-v3": {
        this.imports
          .from("@nahkies/typescript-express-runtime/zod-v3")
          .add("parseRequestInput", "responseValidationFactory")
        break
      }
      case "zod-v4": {
        this.imports
          .from("@nahkies/typescript-express-runtime/zod-v4")
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
      "ExpressRuntimeResponder",
      "ExpressRuntimeResponse",
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
                    req: Request,
                    res: Response,
                    next: NextFunction
                  ) => Promise<ExpressRuntimeResponse<unknown> | typeof SkipResponse>`,
          kind: "type",
        }),
      ],
    })

    statements.push(`
const ${symbols.responseBodyValidator} = ${builder.responseValidator()}

// ${builder.operationId}
router.${builder.method.toLowerCase()}(\`${builder.route}\`, async (req: Request, res: Response, next: NextFunction) => {
  try {
   const input = {
    params: ${params.path.schema ? `parseRequestInput(${params.path.name}, req.params, RequestInputType.RouteParam)` : "undefined"},
    query: ${params.query.schema ? `parseRequestInput(${params.query.name}, ${params.query.isSimpleQuery ? `req.query` : `parseQueryParameters(new URL(\`http://localhost\${req.originalUrl}\`).search, ${JSON.stringify(params.query.parameters)})`}, RequestInputType.QueryString)` : "undefined"},
    ${params.body.schema && !params.body.isSupported ? `// todo: request bodies with content-type '${params.body.contentType}' not yet supported\n` : ""}body: ${params.body.schema ? (params.body.contentType === "application/octet-stream" ? `parseRequestInput(${params.body.schema}, await parseOctetStream(req), RequestInputType.RequestBody)` : `parseRequestInput(${params.body.schema}, req.body, RequestInputType.RequestBody)${!params.body.isSupported ? " as never" : ""}`) : "undefined"},
    headers: ${params.header.schema ? `parseRequestInput(${params.header.name}, req.headers, RequestInputType.RequestHeader)` : "undefined"}
   }

   const responder = ${responder.implementation}

   await implementation.${symbols.implPropName}(input, responder, req, res, next)
    .catch(handleImplementationError)
    .then(handleResponse(res, ${symbols.responseBodyValidator}))

  } catch (error) {
    next(error)
  }
})
`)
    return statements.join("\n\n")
  }

  protected buildRouter(routerName: string, statements: string[]): string {
    const moduleName = titleCase(routerName)
    const implementationExportName = `${moduleName}Implementation`
    const createRouterExportName = `create${moduleName}Router`

    return `
${this.operationTypes.flatMap((it) => it.statements).join("\n\n")}

${this.implementationExport(implementationExportName)}

export function ${createRouterExportName}(implementation: ${implementationExportName}): Router {
  const router = Router()

  ${statements.join("\n\n")}

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

  protected operationSymbols(operationId: string): ServerSymbols {
    return {
      implPropName: operationId,
      implTypeName: titleCase(operationId),
      responderName: `${titleCase(operationId)}Responder`,
      responseBodyValidator: `${operationId}ResponseBodyValidator`,
    }
  }
}
