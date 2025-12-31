import type {OpenapiLoader} from "./loaders/openapi-loader"
import {logger} from "./logger"
import {ParameterNormalizer} from "./normalization/parameter-normalizer"
import {SchemaNormalizer} from "./normalization/schema-normalizer"
import type {
  MediaType,
  Operation,
  Reference,
  RequestBody,
  Responses,
  Schema,
  Server,
  xInternalPreproccess,
} from "./openapi-types"
import type {
  IRModel,
  IROperation,
  IRPreprocess,
  IRRequestBody,
  IRResponse,
  IRServer,
  IRServerVariable,
  MaybeIRModel,
} from "./openapi-types-normalized"
import {extractPlaceholders, isRef} from "./openapi-utils"
import {
  defaultSyntheticNameGenerator,
  type SyntheticNameGenerator,
} from "./synthetic-name-generator"
import {camelCase, coalesce, isDefined, isHttpMethod} from "./utils"

export type OperationGroup = {name: string; operations: IROperation[]}
export type OperationGroupStrategy = "none" | "first-tag" | "first-slug"

export type InputConfig = {
  extractInlineSchemas: boolean
  enumExtensibility: "open" | "closed"
}

export interface ISchemaProvider {
  schema(maybeRef: MaybeIRModel): IRModel
}

export class Input implements ISchemaProvider {
  constructor(
    private loader: OpenapiLoader,
    readonly config: InputConfig,
    private readonly syntheticNameGenerator: SyntheticNameGenerator = defaultSyntheticNameGenerator,
    private readonly schemaNormalizer = new SchemaNormalizer(config),
    private readonly parameterNormalizer = new ParameterNormalizer(
      loader,
      schemaNormalizer,
      syntheticNameGenerator,
    ),
  ) {}

  name(): string {
    return this.loader.entryPoint.info.title
  }

  servers(): IRServer[] {
    // todo: default of `{url: "/"}` where `/` is resolved relative to base path when generating from http specification
    return this.normalizeServers(coalesce(this.loader.entryPoint.servers, []))
  }

  allSchemas(): Record<string, IRModel> {
    const allDocuments = this.loader.allDocuments()

    const schemas = allDocuments.reduce(
      (acc, it) => {
        return Object.assign(acc, it.components?.schemas ?? {})
      },
      {} as {
        [schemaName: string]: Schema | Reference
      },
    )

    return Object.fromEntries(
      Object.entries(schemas).map(([name, maybeSchema]) => {
        const schema = this.schemaNormalizer.normalize(
          this.loader.schema(maybeSchema),
        )
        return [name, schema]
      }),
    )
  }

  groupedOperations(
    strategy: OperationGroupStrategy = "none",
  ): OperationGroup[] {
    switch (strategy) {
      case "none": {
        return [{name: "", operations: this.allOperations()}]
      }
      case "first-tag":
        return this.operationsByFirstTag()
      case "first-slug":
        return this.operationsByFirstSlug()
      default:
        throw new Error(`unsupported grouping strategy '${strategy}'`)
    }
  }

  allOperations(): IROperation[] {
    const result: IROperation[] = []

    for (let [route, paths] of Object.entries(
      this.loader.entryPoint.paths ?? [],
    )) {
      paths = this.loader.paths(paths)

      const additionalAttributes = Object.fromEntries(
        Object.entries(paths).filter(
          ([key]) => key !== "parameters" && !isHttpMethod(key),
        ),
      )

      const methods = Object.fromEntries(
        Object.entries(paths).filter(([key]) => isHttpMethod(key)),
      ) as Record<string, Operation | Reference>

      for (let [method, definition] of Object.entries(methods)) {
        if (!definition) {
          continue
        }

        method = method.toUpperCase()

        if (!isHttpMethod(method)) {
          throw new Error(`unsupported method '${method}'`)
        }

        definition = this.loader.operation(definition)

        const operationId = this.normalizeOperationId(
          definition.operationId,
          method,
          route,
        )

        const parameters = (paths.parameters ?? []).concat(
          definition.parameters ?? [],
        )

        if (definition.callbacks) {
          throw new Error("callbacks are not supported")
        }

        result.push({
          ...additionalAttributes,
          route,
          method,
          servers: this.normalizeServers(
            coalesce(definition.servers, paths.servers, []),
          ),
          parameters: this.parameterNormalizer.normalizeParameters(
            operationId,
            parameters,
          ),
          operationId,
          tags: definition.tags ?? [],
          requestBody: this.normalizeRequestBodyObject(
            operationId,
            definition.requestBody,
          ),
          responses: this.normalizeResponsesObject(
            operationId,
            definition.responses,
          ),
          summary: definition.summary,
          description: definition.description,
          deprecated: definition.deprecated ?? false,
        })
      }
    }

    return result
  }

  private operationsByFirstTag(): OperationGroup[] {
    return this.groupOperations((operation) => {
      const tag = operation.tags[0]

      if (!tag) {
        return "generated"
      }

      return tag.toLowerCase()
    })
  }

  private operationsByFirstSlug(): OperationGroup[] {
    return this.groupOperations((operation) => {
      const slug = (
        operation.route.split("/").find((it) => !!it) ?? ""
      ).replace(/[{}]*/g, "")

      if (!slug) {
        return "generated"
      }

      return slug.toLowerCase()
    })
  }

  private groupOperations(
    groupBy: (operation: IROperation) => string | undefined,
  ): OperationGroup[] {
    return Object.entries(
      this.allOperations().reduce(
        (result, operation) => {
          const key = groupBy(operation)
          if (key) {
            const group = result[key] ?? []
            group.push(operation)

            result[key] = group
          } else {
            logger.warn("no group criteria for operation, skipping", {
              operation,
            })
          }

          return result
        },
        {} as Record<string, IROperation[]>,
      ),
    ).map(([name, operations]) => ({name, operations}))
  }

  schema(maybeRef: MaybeIRModel): IRModel {
    if (isRef(maybeRef)) {
      const schema = this.loader.schema(maybeRef)
      return this.schemaNormalizer.isNormalized(schema)
        ? schema
        : this.schemaNormalizer.normalize(schema)
    }

    return maybeRef
  }

  isRecordNever(schemaObject: MaybeIRModel): boolean {
    const dereferenced = this.schema(schemaObject)

    return (
      dereferenced.type === "record" &&
      !isRef(dereferenced.value) &&
      dereferenced.value.type === "never"
    )
  }

  private isPrimitiveOrRef(schemaObject: MaybeIRModel): boolean {
    return (
      isRef(schemaObject) ||
      ["string", "number", "boolean", "null", "any", "never"].includes(
        schemaObject.type,
      ) ||
      (schemaObject.type === "record" &&
        this.isPrimitiveOrRef(schemaObject.value)) ||
      (schemaObject.type === "array" &&
        this.isPrimitiveOrRef(schemaObject.items)) ||
      ((schemaObject.type === "union" ||
        schemaObject.type === "intersection") &&
        schemaObject.schemas.every((it) => this.isPrimitiveOrRef(it)))
    )
  }

  preprocess(maybePreprocess: Reference | xInternalPreproccess): IRPreprocess {
    return this.loader.preprocess(maybePreprocess)
  }

  private normalizeServers(servers: Server[]): IRServer[] {
    return servers
      .filter((it) => it.url)
      .map((it) => {
        const variables = Object.entries(it.variables ?? {}).map(
          ([key, value]): IRServerVariable => ({
            name: key,
            enum: value.enum ?? [],
            default: value.default,
            description: value.description,
          }),
        )

        const placeholders = extractPlaceholders(it.url)
          .map((it) => it.placeholder)
          .filter(isDefined)

        for (const placeholder of placeholders) {
          const variable = variables.find((it) => it.name === placeholder)

          if (!variable) {
            logger.warn(
              `missing placeholder variable for server url '${it.url}' - inserting variable of type string with no default`,
            )
            variables.push({
              name: placeholder,
              default: undefined,
              enum: [],
              description: undefined,
            })
          }
        }

        return {
          url: it.url,
          description: it.description,
          variables,
        }
      })
  }

  private normalizeRequestBodyObject(
    operationId: string,
    requestBody?: RequestBody | Reference,
  ): IRRequestBody | undefined {
    if (!requestBody) {
      return undefined
    }

    // biome-ignore lint/style/noParameterAssign: resolve $ref
    requestBody = this.loader.requestBody(requestBody)

    return {
      description: requestBody.description,
      required: requestBody.required ?? true,
      content: this.normalizeMediaTypes(
        requestBody.content ?? {},
        operationId,
        "RequestBody",
        undefined,
      ),
    }
  }

  private normalizeResponsesObject(
    operationId: string,
    responses?: Responses,
  ):
    | {
        [statusCode: string]: IRResponse
      }
    | undefined {
    if (!responses) {
      return undefined
    }

    return Object.fromEntries(
      Object.entries(responses).map(([statusCode, response]) => {
        response = response ? this.loader.response(response) : {}

        return [
          statusCode,
          {
            headers: {},
            description: response.description,
            content: this.normalizeMediaTypes(
              response.content ?? {},
              operationId,
              "ResponseBody",
              statusCode,
            ),
          },
        ]
      }),
    )
  }

  private normalizeOperationId(
    operationId: string | undefined,
    method: string,
    route: string,
  ) {
    if (operationId) {
      return camelCase(operationId)
    }

    return camelCase([method, ...route.split("/")].join("-"))
  }

  private normalizeMediaTypes(
    mediaTypes: {
      [mediaType: string]: MediaType
    },
    operationId: string,
    context: "RequestBody" | "ResponseBody",
    statusCode: number | string | undefined,
  ) {
    const filtered = Object.entries(mediaTypes)
      // Sometimes people pass `{}` as the MediaType for 204 responses, filter these out
      .filter(([, mediaType]) => Boolean(mediaType.schema))

    const hasMultipleMediaTypes = filtered.length > 1

    return Object.fromEntries(
      filtered.map(([contentType, mediaType]) => {
        return [
          contentType,
          {
            schema: this.normalizeMediaTypeSchema(
              operationId,
              contentType,
              mediaType.schema,
              context,
              statusCode,
              hasMultipleMediaTypes,
            ),
            encoding: mediaType.encoding,
          },
        ]
      }),
    )
  }

  private normalizeMediaTypeSchema(
    operationId: string,
    mediaType: string,
    schema: Schema | Reference,
    context: "RequestBody" | "ResponseBody",
    statusCode: number | string | undefined,
    hasMultipleMediaTypes: boolean,
  ): MaybeIRModel {
    const syntheticName =
      context === "RequestBody"
        ? this.syntheticNameGenerator.forRequestBody({
            operationId,
            mediaType,
            hasMultipleMediaTypes,
            config: this.config,
          })
        : this.syntheticNameGenerator.forResponseBody({
            operationId,
            mediaType,
            statusCode,
            hasMultipleMediaTypes,
            config: this.config,
          })

    const result = this.schemaNormalizer.normalize(schema)

    const shouldCreateVirtualType =
      (this.config.extractInlineSchemas || context === "RequestBody") &&
      !this.isPrimitiveOrRef(result)

    return shouldCreateVirtualType
      ? this.loader.addVirtualType(operationId, syntheticName, schema)
      : result
  }
}
