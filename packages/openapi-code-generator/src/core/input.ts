import {generationLib} from "./generation-lib"
import {logger} from "./logger"
import type {OpenapiLoader} from "./openapi-loader"
import type {
  MediaType,
  Operation,
  Parameter,
  Reference,
  RequestBody,
  Responses,
  Schema,
  SchemaObject,
  Server,
  Style,
  xInternalPreproccess,
} from "./openapi-types"
import type {
  IRModel,
  IRModelArray,
  IRModelBase,
  IRModelBoolean,
  IRModelNumeric,
  IRModelObject,
  IRModelString,
  IROperation,
  IROperationParameters,
  IRParameter,
  IRParameterBase,
  IRParameterCookie,
  IRParameterHeader,
  IRParameterPath,
  IRParameterQuery,
  IRPreprocess,
  IRRef,
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
import {
  camelCase,
  coalesce,
  deepEqual,
  isDefined,
  isHttpMethod,
  lowerFirst,
} from "./utils"

export type OperationGroup = {name: string; operations: IROperation[]}
export type OperationGroupStrategy =
  | "none"
  | "first-tag"
  | "first-slug"
  | "route"

export type InputConfig = {
  extractInlineSchemas: boolean
  enumExtensibility: "open" | "closed"
}

export class Input {
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
      case "route":
        return this.operationsByRoute()
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

  private operationsByRoute(): OperationGroup[] {
    return this.groupOperations((operation) => {
      return operation.route
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
      !isRef(result) &&
      !isRef(schema) &&
      (result.type === "object" ||
        (result.type === "array" &&
          !isRef(result.items) &&
          result.items.type === "object"))

    return shouldCreateVirtualType
      ? this.loader.addVirtualType(operationId, syntheticName, result)
      : result
  }
}

export class ParameterNormalizer {
  constructor(
    private readonly loader: OpenapiLoader,
    private readonly schemaNormalizer: SchemaNormalizer,
    private readonly syntheticNameGenerator: SyntheticNameGenerator,
  ) {}

  public normalizeParameters(
    operationId: string,
    parameters: (Parameter | Reference)[] = [],
  ): IROperationParameters {
    const allParameters = parameters.map((it) => this.loader.parameter(it))

    const pathParameters = allParameters.filter((it) => it.in === "path")
    const queryParameters = allParameters.filter((it) => it.in === "query")
    const headerParameters = allParameters.filter((it) => it.in === "header")

    const normalizedParameters = allParameters.map((it) =>
      this.normalizeParameter(it),
    )

    return {
      all: normalizedParameters,
      path: {
        name: lowerFirst(
          this.syntheticNameGenerator.forPathParameters({operationId}),
        ),
        list: normalizedParameters.filter((it) => it.in === "path"),
        $ref: pathParameters.length
          ? this.loader.addVirtualType(
              operationId,
              this.syntheticNameGenerator.forPathParameters({operationId}),
              this.reduceParametersToOpenApiSchema(pathParameters),
            )
          : undefined,
      },
      query: {
        name: lowerFirst(
          this.syntheticNameGenerator.forQueryParameters({operationId}),
        ),
        list: normalizedParameters.filter((it) => it.in === "query"),
        $ref: queryParameters.length
          ? this.loader.addVirtualType(
              operationId,
              this.syntheticNameGenerator.forQueryParameters({operationId}),
              this.reduceParametersToOpenApiSchema(queryParameters),
            )
          : undefined,
      },
      header: {
        name: lowerFirst(
          this.syntheticNameGenerator.forRequestHeaders({operationId}),
        ),
        list: normalizedParameters.filter((it) => it.in === "header"),
        $ref: headerParameters.length
          ? this.loader.addVirtualType(
              operationId,
              this.syntheticNameGenerator.forRequestHeaders({operationId}),
              this.reduceParametersToOpenApiSchema(
                headerParameters.map((it) => ({
                  ...it,
                  name: it.name.toLowerCase(),
                })),
              ),
            )
          : undefined,
      },
    }
  }

  private reduceParametersToOpenApiSchema(
    parameters: Parameter[],
  ): SchemaObject {
    const properties: Record<string, Schema | Reference> = {}
    const required: string[] = []

    for (const parameter of parameters) {
      const schema = parameter.schema

      const dereferenced = this.loader.schema(schema)

      /**
       * HACK: With exploded array query parameters, you can't tell between an
       * array with one element and plain parameter without runtime schema information.
       * If it's supposed to be an array, and it's a scalar, coerce to an array.
       *
       * When better support for explode / style lands, we might be able to remove this.
       */
      if (parameter.in === "query" && dereferenced.type === "array") {
        schema["x-internal-preprocess"] = {
          deserialize: {
            fn: "(it: unknown) => Array.isArray(it) || it === undefined ? it : [it]",
          },
        }
      }

      properties[parameter.name] = schema

      if (parameter.required) {
        required.push(parameter.name)
      }
    }

    return {
      type: "object",
      properties,
      required,
      additionalProperties: false,
      nullable: false,
    }
  }

  public normalizeParameter(it: Parameter): IRParameter {
    const base = {
      name: it.name,
      schema: this.schemaNormalizer.normalize(it.schema),
      description: it.description,
      required: it.required ?? false,
      deprecated: it.deprecated ?? false,
    } satisfies Omit<IRParameterBase, "explode">

    function throwUnsupportedStyle(style: Style): never {
      throw new Error(
        `unsupported parameter style: '${style}' for in: '${it.in}'`,
      )
    }

    switch (it.in) {
      case "path": {
        const style = it.style ?? "simple"
        const explode = this.explodeForParameter(it, style)

        if (!this.isStyleForPathParameter(style)) {
          throwUnsupportedStyle(style)
        }

        return {
          ...base,
          in: "path",
          required: true,
          style,
          explode,
        } satisfies IRParameterPath
      }

      case "query": {
        const style = it.style ?? "form"
        const explode = this.explodeForParameter(it, style)

        if (!this.isStyleForQueryParameter(style)) {
          throwUnsupportedStyle(style)
        }

        return {
          ...base,
          in: "query",
          style,
          explode,
          allowEmptyValue: it.allowEmptyValue ?? false,
        } satisfies IRParameterQuery
      }

      case "header": {
        const style = it.style ?? "simple"
        const explode = this.explodeForParameter(it, style)

        if (!this.isStyleForHeaderParameter(style)) {
          throwUnsupportedStyle(style)
        }

        return {
          ...base,
          in: "header",
          style,
          explode,
        } satisfies IRParameterHeader
      }

      case "cookie": {
        const style = it.style ?? "form"
        const explode = this.explodeForParameter(it, style)

        if (!this.isStyleForCookieParameter(style)) {
          throwUnsupportedStyle(style)
        }

        return {
          ...base,
          in: "cookie",
          style,
          explode,
        } satisfies IRParameterCookie
      }

      default: {
        throw new Error(
          `unsupported parameter location: '${it.in satisfies never}'`,
        )
      }
    }
  }

  private isStyleForPathParameter(
    style: Style,
  ): style is IRParameterPath["style"] {
    return ["simple", "label", "matrix", "template"].includes(style)
  }

  private isStyleForQueryParameter(
    style: Style,
  ): style is IRParameterQuery["style"] {
    return ["form", "spaceDelimited", "pipeDelimited", "deepObject"].includes(
      style,
    )
  }

  private isStyleForHeaderParameter(
    style: Style,
  ): style is IRParameterHeader["style"] {
    return ["simple"].includes(style)
  }

  private isStyleForCookieParameter(
    style: Style,
  ): style is IRParameterCookie["style"] {
    if (style === "cookie") {
      // todo: openapi v3.2.0
      throw new Error("support for style: cookie not implemented.")
    }

    return ["form"].includes(style)
  }

  private explodeForParameter(parameter: Parameter, style: Style): boolean {
    if (typeof parameter.explode === "boolean") {
      return parameter.explode
    }

    /**
     * "When style is "form" or "cookie", the default value is true. For all other styles, the default value is false."
     * ref: {@link https://spec.openapis.org/oas/v3.2.0.html#parameter-explode}
     */
    if (style === "form" || style === "cookie") {
      return true
    }

    return false
  }
}

export class SchemaNormalizer {
  constructor(readonly config: InputConfig) {}

  public isNormalized(schema: Schema | IRModel): schema is IRModel {
    return Reflect.get(schema, "isIRModel")
  }

  public normalize(schemaObject: Schema): IRModel
  public normalize(schemaObject: Reference): IRRef
  public normalize(schemaObject: Schema | Reference): IRModel | IRRef
  public normalize(schemaObject: Schema | Reference): IRModel | IRRef {
    const self = this

    if (isRef(schemaObject)) {
      return schemaObject satisfies IRRef
    }

    if (this.isNormalized(schemaObject)) {
      throw new Error("double normalization!")
    }

    // TODO: HACK: translates a type array into a a oneOf - unsure if this makes sense,
    //             or is the cleanest way to do it. I'm fairly sure this will work fine
    //             for most things though.
    if (Array.isArray(schemaObject.type)) {
      const nullable = Boolean(schemaObject.type.find((it) => it === "null"))
      return self.normalize({
        type: "object",
        oneOf: schemaObject.type
          .filter((it) => it !== "null")
          .map((it) => ({
            ...schemaObject,
            type: it,
            nullable,
          })),
      })
    }

    const base: IRModelBase = {
      isIRModel: true,
      nullable: schemaObject.nullable || false,
      readOnly: schemaObject.readOnly || false,
      default: schemaObject.default,
      "x-internal-preprocess": schemaObject["x-internal-preprocess"],
    }

    switch (schemaObject.type) {
      case undefined: {
        if (
          deepEqual(schemaObject, {}) ||
          deepEqual(schemaObject, {additionalProperties: true})
        ) {
          return {...base, type: "any"}
        }

        return self.normalize({...schemaObject, type: "object"})
      }
      case "null": // TODO: HACK to support OA 3.1
      case "object": {
        if (
          !schemaObject.allOf?.length &&
          !schemaObject.oneOf?.length &&
          !schemaObject.anyOf?.length &&
          Object.keys(schemaObject.properties ?? {}).length === 0 &&
          schemaObject.additionalProperties === undefined
        ) {
          return {
            ...base,
            type: "object",
            additionalProperties: true,
            properties: {},
            allOf: [],
            oneOf: [],
            anyOf: [],
            required: [],
          }
        }

        const properties = normalizeProperties(schemaObject.properties)

        const hasNull =
          hasATypeNull(schemaObject.allOf) ||
          hasATypeNull(schemaObject.oneOf) ||
          hasATypeNull(schemaObject.anyOf)

        const allOf = normalizeAllOf(schemaObject.allOf)
        const oneOf = normalizeOneOf(schemaObject.oneOf)
        const anyOf = normalizeAnyOf(schemaObject.anyOf)

        const required = (schemaObject.required ?? []).filter((it) => {
          const include = Reflect.has(properties, it)

          if (!include) {
            logger.warn("skipping required property not present on object")
          }

          return include
        })

        const additionalProperties = normalizeAdditionalProperties(
          schemaObject.additionalProperties,
        )

        return {
          ...base,
          // TODO: HACK
          nullable: base.nullable || schemaObject.type === "null" || hasNull,
          type: "object",
          allOf,
          oneOf,
          anyOf,
          required,
          properties,
          additionalProperties,
        } satisfies IRModelObject
      }
      case "array": {
        let items = schemaObject.items

        if (!items) {
          logger.warn("array object missing items property", {schemaObject})
          items = {$ref: generationLib.UnknownObject$Ref}
        }

        return {
          ...base,
          type: schemaObject.type,
          items: self.normalize(items),
          uniqueItems: schemaObject.uniqueItems || false,
          minItems: schemaObject.minItems,
          maxItems: schemaObject.maxItems,
        } satisfies IRModelArray
      }
      case "number":
      case "integer": {
        const schemaObjectEnum = (schemaObject.enum ?? []) as unknown[]
        const nullable = schemaObjectEnum.includes(null)
        const enumValues = schemaObjectEnum.filter((it): it is number =>
          Number.isFinite(it),
        )

        const calcMaximums = () => {
          // draft-wright-json-schema-validation-01 changed "exclusiveMaximum"/"exclusiveMinimum" from boolean modifiers
          // of "maximum"/"minimum" to independent numeric fields.
          // we need to support both.
          if (typeof schemaObject.exclusiveMaximum === "boolean") {
            if (schemaObject.exclusiveMaximum) {
              return {
                exclusiveMaximum: schemaObject.maximum,
                inclusiveMaximum: undefined,
              }
            } else {
              return {
                exclusiveMaximum: undefined,
                inclusiveMaximum: schemaObject.maximum,
              }
            }
          }

          return {exclusiveMaximum: schemaObject.exclusiveMaximum}
        }

        const calcMinimums = () => {
          // draft-wright-json-schema-validation-01 changed "exclusiveMaximum"/"exclusiveMinimum" from boolean modifiers
          // of "maximum"/"minimum" to independent numeric fields.
          // we need to support both.
          if (typeof schemaObject.exclusiveMinimum === "boolean") {
            if (schemaObject.exclusiveMinimum) {
              return {
                exclusiveMinimum: schemaObject.minimum,
                inclusiveMinimum: undefined,
              }
            } else {
              return {
                exclusiveMinimum: undefined,
                inclusiveMinimum: schemaObject.minimum,
              }
            }
          }

          return {exclusiveMinimum: schemaObject.exclusiveMinimum}
        }

        return {
          ...base,
          nullable: nullable || base.nullable,
          type: "number",
          // todo: https://github.com/mnahkies/openapi-code-generator/issues/51
          format: schemaObject.format,
          enum: enumValues.length ? enumValues : undefined,
          inclusiveMaximum: schemaObject.maximum,
          inclusiveMinimum: schemaObject.minimum,
          multipleOf: schemaObject.multipleOf,
          ...calcMaximums(),
          ...calcMinimums(),
          "x-enum-extensibility": enumValues.length
            ? (schemaObject["x-enum-extensibility"] ??
              self.config.enumExtensibility)
            : undefined,
        } satisfies IRModelNumeric
      }
      case "string": {
        const schemaObjectEnum = (schemaObject.enum ?? []) as unknown[]
        const nullable = schemaObjectEnum.includes(null)
        const enumValues = schemaObjectEnum
          .filter((it) => it !== undefined && it !== null)
          .map((it) => String(it))

        return {
          ...base,
          nullable: nullable || base.nullable,
          type: schemaObject.type,
          format: schemaObject.format,
          enum: enumValues.length ? enumValues : undefined,
          maxLength: schemaObject.maxLength,
          minLength: schemaObject.minLength,
          pattern: schemaObject.pattern,

          "x-enum-extensibility": enumValues.length
            ? (schemaObject["x-enum-extensibility"] ??
              self.config.enumExtensibility)
            : undefined,
        } satisfies IRModelString
      }
      case "boolean": {
        const schemaObjectEnum = (schemaObject.enum ?? []) as unknown[]
        const nullable = schemaObjectEnum.includes(null)
        const enumValues = schemaObjectEnum
          .filter((it) => it !== undefined && it !== null)
          .map((it) => String(it).toLowerCase())

        return {
          ...base,
          enum: enumValues.length ? enumValues : undefined,
          nullable: nullable || base.nullable,
          type: schemaObject.type,
        } satisfies IRModelBoolean
      }
      // custom extension types used internally
      case "any": {
        return {
          ...base,
          type: "any",
        }
      }
      case "never": {
        return {
          ...base,
          type: "never",
        }
      }
      default: {
        throw new Error(
          `unsupported type '${schemaObject.type satisfies never}'`,
        )
      }
    }

    function normalizeProperties(
      properties: SchemaObject["properties"] = {},
    ): Record<string, MaybeIRModel> {
      return Object.entries(properties ?? {}).reduce(
        (result, [name, schemaObject]) => {
          result[name] = self.normalize(schemaObject)
          return result
        },
        {} as Record<string, MaybeIRModel>,
      )
    }

    function normalizeAdditionalProperties(
      additionalProperties: SchemaObject["additionalProperties"] = false,
    ): boolean | MaybeIRModel {
      if (typeof additionalProperties === "boolean") {
        return additionalProperties
      }

      // `additionalProperties: {}` is equivalent to `additionalProperties: true`
      if (
        typeof additionalProperties === "object" &&
        deepEqual(additionalProperties, {})
      ) {
        return true
      }

      return self.normalize(additionalProperties)
    }

    function normalizeAllOf(allOf: SchemaObject["allOf"] = []): MaybeIRModel[] {
      return allOf
        ?.filter((it) => isRef(it) || it.type !== "null")
        .map((it) => self.normalize(it))
    }

    function normalizeOneOf(oneOf: SchemaObject["oneOf"] = []): MaybeIRModel[] {
      return oneOf
        .filter((it) => isRef(it) || it.type !== "null")
        .map((it) => self.normalize(it))
    }

    function normalizeAnyOf(anyOf: SchemaObject["anyOf"] = []): MaybeIRModel[] {
      return anyOf
        .filter((it) => {
          // todo: Github spec uses some complex patterns with anyOf in some situations that aren't well supported. Eg:
          //       anyOf: [ {required: ["bla"]}, {required: ["foo"]} ] in addition to top-level schema, which looks like
          //       it's intended to indicate that at least one of the objects properties must be set (consider it a
          //       Omit<Partial<Thing>, EmptyObject> )
          return isRef(it) || (Boolean(it.type) && it.type !== "null")
        })
        .map((it) => self.normalize(it))
    }

    function hasATypeNull(arr?: (Schema | Reference)[]) {
      return Boolean(
        arr?.find((it) => {
          return !isRef(it) && it.type === "null"
        }),
      )
    }
  }
}
