import _ from "lodash"
import type {Input} from "../../../core/input"
import type {IROperation} from "../../../core/openapi-types-normalized"
import {titleCase, upperFirst} from "../../../core/utils"
import {CompilationUnit, type ICompilable} from "../../common/compilation-units"
import type {ImportBuilder} from "../../common/import-builder"
import {JoiBuilder} from "../../common/schema-builders/joi-schema-builder"
import type {SchemaBuilder} from "../../common/schema-builders/schema-builder"
import {ZodBuilder} from "../../common/schema-builders/zod-schema-builder"
import type {TypeBuilder} from "../../common/type-builder"
import {intersect, object} from "../../common/type-utils"
import {
  buildExport,
  requestBodyAsParameter,
  statusStringToType,
} from "../../common/typescript-common"
import {reduceParamsToOpenApiSchema} from "../server-operation-builder"

export class TypescriptNextjsRouterBuilder implements ICompilable {
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
        "KoaRuntimeResponse",
        "KoaRuntimeResponder",
        "StatusCode2xx",
        "StatusCode3xx",
        "StatusCode4xx",
        "StatusCode5xx",
        "StatusCode",
      )

    this.imports.from("next/server").add("NextRequest")

    this.imports
      .from("@nahkies/typescript-koa-runtime/errors")
      .add("KoaRuntimeError", "RequestInputType")

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
      const name = `${operation.operationId}ParamSchema`
      pathParamsType = types.schemaObjectToType(
        this.input.loader.addVirtualType(
          operation.operationId,
          _.upperFirst(name),
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
          _.upperFirst(name),
          reduceParamsToOpenApiSchema(queryParams),
        ),
      )
      this.statements.push(`const ${name} = ${querySchema.toString()}`)
    }

    if (headerSchema) {
      const name = `${operation.operationId}HeaderSchema`

      headerParamsType = types.schemaObjectToType(
        this.input.loader.addVirtualType(
          operation.operationId,
          upperFirst(name),
          reduceParamsToOpenApiSchema(headerParams),
        ),
      )
      this.statements.push(`const ${name} = ${headerSchema.toString()}`)
    }

    if (bodyParamSchema && requestBodyParameter) {
      const name = `${operation.operationId}BodySchema`
      bodyParamsType = types.schemaObjectToType(
        this.input.loader.addVirtualType(
          operation.operationId,
          _.upperFirst(name),
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
          name: `${titleCase(operation.operationId)}Responder`,
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
                    }, ${headerParamsType}>,
                    respond: ${titleCase(operation.operationId)}Responder,
                    ctx: {request: NextRequest}
                  ) => Promise<KoaRuntimeResponse<unknown>>`,
          kind: "type",
        }),
      ],
    })

    this.statements.push(
      buildExport({
        name: `_${operation.method.toUpperCase()}`,
        kind: "const",
        value: `(implementation: ${titleCase(operation.operationId)}) => async (request: NextRequest, {params}: {params: unknown}): Promise<Response> => {
  const input = {
        params: ${
          paramSchema
            ? `parseRequestInput(${operation.operationId}ParamSchema, params, RequestInputType.RouteParam)`
            : "undefined"
        },
        // TODO: this swallows repeated parameters
        query: ${
          querySchema
            ? `parseRequestInput(${operation.operationId}QuerySchema, Object.fromEntries(request.nextUrl.searchParams.entries()), RequestInputType.QueryString)`
            : "undefined"
        },
        body: ${
          bodyParamSchema
            ? `parseRequestInput(${operation.operationId}BodySchema, await request.json(), RequestInputType.RequestBody)`
            : "undefined"
        },
        headers: ${
          headerSchema
            ? `parseRequestInput(${operation.operationId}HeaderSchema, Reflect.get(ctx.request, "headers"), RequestInputType.RequestHeader)`
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

       const {
        status,
        body,
      } = await implementation(input, responder, {request})
          .then(it => it.unpack())
          .catch(err => { throw KoaRuntimeError.HandlerError(err) })

  return body !== undefined ? Response.json(body, {status}) : new Response(undefined, {status})
  }`,
      }),
    )
  }

  toString(): string {
    const routes = this.statements
    const code = `
${this.operationTypes.flatMap((it) => it.statements).join("\n\n")}

${routes.join("\n\n")}
`
    return code
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
