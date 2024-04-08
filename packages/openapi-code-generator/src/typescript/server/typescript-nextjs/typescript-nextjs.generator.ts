// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import fs from "fs"
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import path from "path"
import _ from "lodash"
import {
  Project,
  type SourceFile,
  StructureKind,
  SyntaxKind,
  VariableDeclarationKind,
} from "ts-morph"
import type {Input} from "../../../core/input"
import type {CompilerOptions} from "../../../core/loaders/tsconfig.loader"
import type {
  IRModelObject,
  IROperation,
  IRParameter,
} from "../../../core/openapi-types-normalized"
import {isTruthy} from "../../../core/utils"
import {
  type HttpMethod,
  isDefined,
  isHttpMethod,
  titleCase,
  upperFirst,
} from "../../../core/utils"
import type {OpenapiTypescriptGeneratorConfig} from "../../../templates.types"
import {TypescriptFetchClientBuilder} from "../../client/typescript-fetch/typescript-fetch-client-builder"
import {CompilationUnit, type ICompilable} from "../../common/compilation-units"
import {ImportBuilder} from "../../common/import-builder"
import {JoiBuilder} from "../../common/schema-builders/joi-schema-builder"
import {
  type SchemaBuilder,
  schemaBuilderFactory,
} from "../../common/schema-builders/schema-builder"
import {ZodBuilder} from "../../common/schema-builders/zod-schema-builder"
import {TypeBuilder} from "../../common/type-builder"
import {intersect, object} from "../../common/type-utils"
import {
  buildExport,
  requestBodyAsParameter,
  statusStringToType,
} from "../../common/typescript-common"

function reduceParamsToOpenApiSchema(parameters: IRParameter[]): IRModelObject {
  return parameters.reduce(
    (acc, parameter) => {
      acc.properties[parameter.name] = parameter.schema

      if (parameter.required) {
        acc.required.push(parameter.name)
      }

      return acc
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

export class NextJSAppRouterBuilder implements ICompilable {
  constructor(
    public readonly filename: string,
    private readonly imports: ImportBuilder,
    private readonly companionFilename: string,
    private readonly sourceFile: SourceFile,
  ) {}

  private readonly httpMethodsUsed = new Set<HttpMethod>()

  add(operation: IROperation): void {
    const sourceFile = this.sourceFile

    const hasPathParam =
      operation.parameters.filter((it) => it.in === "path").length > 0
    const hasQueryParam =
      operation.parameters.filter((it) => it.in === "query").length > 0
    const hasBodyParam = Boolean(
      requestBodyAsParameter(operation).requestBodyParameter,
    )

    const wrappingMethod = `_${operation.method.toUpperCase()}`

    this.httpMethodsUsed.add(operation.method)

    // Get the existing function, or create a new default one
    const variableDeclaration =
      sourceFile
        .getVariableDeclaration(operation.method.toUpperCase())
        ?.getVariableStatement() ||
      sourceFile.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: operation.method.toUpperCase(),
            kind: StructureKind.VariableDeclaration,
            initializer: `${wrappingMethod}(async (input, respond, context) => {
            // TODO: implementation
            return respond.withStatus(501).body({message: "not implemented"} as any)
          })`,
          },
        ],
      })

    // Replace the params based on what inputs we have
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const declarations = variableDeclaration.getDeclarations()[0]!
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const innerFunction = declarations
      .getInitializerIfKindOrThrow(SyntaxKind.CallExpression)
      .getArguments()[0]!
      .asKind(SyntaxKind.ArrowFunction)!

    // biome-ignore lint/complexity/noForEach: <explanation>
    innerFunction?.getParameters().forEach((parameter) => {
      parameter.remove()
    })

    innerFunction?.addParameter({
      name: `{${[
        hasPathParam ? "params" : undefined,
        hasQueryParam ? "query" : undefined,
        hasBodyParam ? "body" : undefined,
      ]
        .filter(isDefined)
        .join(",")}}`,
    })

    innerFunction?.addParameter({name: "respond"})
    innerFunction?.addParameter({name: "context"})
  }

  toString(): string {
    return this.sourceFile.getFullText()
  }

  toCompilationUnit(): CompilationUnit {
    // Reconcile imports - attempt to find an existing one and replace it with correct one
    const imports = this.sourceFile.getImportDeclarations()
    const from = this.imports.normalizeFrom(
      `./${this.companionFilename}`,
      `./${this.filename}`,
    )
    // biome-ignore lint/complexity/noForEach: <explanation>
    imports
      .filter((it) => it.getModuleSpecifierValue().includes(from))
      .forEach((it) => it.remove())

    this.sourceFile.addImportDeclaration({
      namedImports: Array.from(this.httpMethodsUsed).map((it) => `_${it}`),
      moduleSpecifier: from,
    })

    // Remove any methods that were removed from the spec
    // biome-ignore lint/complexity/noForEach: <explanation>
    this.sourceFile
      .getVariableDeclarations()
      .filter((it) => {
        const name = it.getName()
        return isHttpMethod(name) && !this.httpMethodsUsed.has(name)
      })
      .forEach((it) => it.remove())

    return new CompilationUnit(
      this.filename,
      this.imports,
      this.toString(),
      false,
    )
  }
}

function findImportAlias(dest: string, compilerOptions: CompilerOptions) {
  const relative = `./${path.relative(process.cwd(), dest)}/*`

  const alias = Object.entries(compilerOptions.paths || {}).find(([, paths]) =>
    paths.includes(relative),
  )

  return alias ? alias[0].replace("*", "") : undefined
}

export async function generateTypescriptNextJS(
  config: OpenapiTypescriptGeneratorConfig,
): Promise<void> {
  const {input, emitter, allowAny} = config

  const importAlias = findImportAlias(
    config.emitter.config.destinationDirectory,
    config.compilerOptions,
  )

  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  const subDirectory = process.env["OPENAPI_INTEGRATION_TESTS"]
    ? path.basename(config.input.loader.entryPointKey)
    : ""

  const appDirectory = [".", "app", subDirectory]
    .filter(isTruthy)
    .join(path.sep)
  const generatedDirectory = [".", "generated", subDirectory]
    .filter(isTruthy)
    .join(path.sep)

  const rootTypeBuilder = await TypeBuilder.fromInput(
    [generatedDirectory, "models.ts"].join(path.sep),
    input,
    config.compilerOptions,
    {allowAny},
  )

  const rootSchemaBuilder = await schemaBuilderFactory(
    [generatedDirectory, "schemas.ts"].join(path.sep),
    input,
    config.schemaBuilder,
    {allowAny},
  )

  const project = new Project()

  const serverRouters = (
    await Promise.all(
      input.groupedOperations("route").map(async (group) => {
        const filename = path.join(
          generatedDirectory,
          routeToNextJSFilepath(group.name),
        )

        const imports = new ImportBuilder({filename}, importAlias)

        const routerBuilder = new ServerRouterBuilder(
          filename,
          group.name,
          input,
          imports,
          rootTypeBuilder.withImports(imports),
          rootSchemaBuilder.withImports(imports),
        )

        const nextJsAppRouterPath = path.join(
          appDirectory,
          routeToNextJSFilepath(group.name),
        )

        const existing = fs.existsSync(
          path.join(emitter.config.destinationDirectory, nextJsAppRouterPath),
        )
          ? fs
              .readFileSync(
                path.join(
                  emitter.config.destinationDirectory,
                  nextJsAppRouterPath,
                ),
                "utf-8",
              )
              .toString()
          : ""
        const sourceFile = project.createSourceFile(
          nextJsAppRouterPath,
          existing,
        )

        const nextJSAppRouterBuilder = new NextJSAppRouterBuilder(
          nextJsAppRouterPath,
          imports,
          filename,
          sourceFile,
        )

        for (const operation of group.operations) {
          routerBuilder.add(operation)
          nextJSAppRouterBuilder.add(operation)
        }

        return [
          routerBuilder.toCompilationUnit(),
          nextJSAppRouterBuilder.toCompilationUnit(),
        ]
      }),
    )
  ).flat()

  const clientOutputPath = [generatedDirectory, "clients", "client.ts"].join(
    path.sep,
  )
  const clientImportBuilder = new ImportBuilder(
    {filename: clientOutputPath},
    importAlias,
  )

  const fetchClientBuilder = new TypescriptFetchClientBuilder(
    clientOutputPath,
    "ApiClient",
    input,
    clientImportBuilder,
    rootTypeBuilder.withImports(clientImportBuilder),
    rootSchemaBuilder.withImports(clientImportBuilder),
    {
      enableRuntimeResponseValidation: config.enableRuntimeResponseValidation,
      enableTypedBasePaths: config.enableTypedBasePaths,
    },
  )

  input.allOperations().map((it) => fetchClientBuilder.add(it))

  await emitter.emitGenerationResult([
    ...serverRouters,
    fetchClientBuilder.toCompilationUnit(),
    rootTypeBuilder.toCompilationUnit(),
    rootSchemaBuilder.toCompilationUnit(),
  ])
}

function routeToNextJSFilepath(route: string): string {
  const parts = route
    .split("/")
    .map((part) => part.replaceAll("{", "[").replaceAll("}", "]"))

  parts.push("route.ts")

  return path.join(...parts)
}
