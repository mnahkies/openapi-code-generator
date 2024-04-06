import _ from "lodash"
import {generationLib} from "./generation-lib"
import {logger} from "./logger"
import {OpenapiLoader} from "./openapi-loader"
import {
  MediaType,
  Operation,
  Parameter,
  Reference,
  RequestBody,
  Responses,
  Schema,
} from "./openapi-types"
import {
  IRModel,
  IRModelArray,
  IRModelBase,
  IRModelBoolean,
  IRModelNumeric,
  IRModelObject,
  IRModelString,
  IROperation,
  IRParameter,
  IRRef,
  IRResponse,
  MaybeIRModel,
} from "./openapi-types-normalized"
import {isRef} from "./openapi-utils"
import {deepEqual, isHttpMethod, mediaTypeToIdentifier} from "./utils"

export type OperationGroup = {name: string; operations: IROperation[]}
export type OperationGroupStrategy = "none" | "first-tag" | "first-slug"
export class Input {
  constructor(
    readonly loader: OpenapiLoader,
    readonly config: {extractInlineSchemas: boolean},
  ) {}

  name() {
    return this.loader.entryPoint.info.title
  }

  allSchemas(): Record<string, IRModel> {
    const schemas = this.loader.entryPoint.components?.schemas ?? {}
    return Object.fromEntries(
      Object.entries(schemas).map(([name, maybeSchema]) => {
        return [name, this.schema(normalizeSchemaObject(maybeSchema))]
      }),
    )
  }

  groupedOperations(
    strategy: OperationGroupStrategy = "none",
  ): OperationGroup[] {
    switch (strategy) {
      case "none": {
        return [{name: "generated", operations: this.allOperations()}]
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

    // eslint-disable-next-line prefer-const
    for (let [route, paths] of Object.entries(
      this.loader.entryPoint.paths ?? [],
    )) {
      paths = this.loader.paths(paths)

      const params = this.normalizeParameters(paths.parameters)

      const additionalAttributes = _.pickBy(
        paths,
        (_, key) => key !== "parameters" && !isHttpMethod(key),
      ) as any
      const methods = _.pickBy(paths, (_, it) => isHttpMethod(it)) as Record<
        string,
        Operation | Reference
      >

      // eslint-disable-next-line prefer-const
      for (let [method, definition] of Object.entries(methods)) {
        if (!definition) {
          continue
        }

        definition = this.loader.operation(definition)

        const operationId = this.normalizeOperationId(
          definition.operationId,
          method,
          route,
        )

        result.push({
          ...additionalAttributes,
          route,
          method: method.toUpperCase() as IROperation["method"],
          parameters: params.concat(
            this.normalizeParameters(definition.parameters),
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
      const tag = operation.tags[0] ?? "generated"

      if (!tag) {
        throw new Error(
          `cannot group operations by first tag as operationId: '${operation.operationId}' has no tags`,
        )
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
        throw new Error(
          `cannot group operations by first slug as operationId: '${operation.operationId}' has no slugs`,
        )
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
            logger.warn("no group criteria for operation, skipping", operation)
          }

          return result
        },
        {} as Record<string, IROperation[]>,
      ),
    ).map(([name, operations]) => ({name, operations}))
  }

  schema(maybeRef: Reference | Schema): IRModel {
    const schema = this.loader.schema(maybeRef)
    return normalizeSchemaObject(schema)
  }

  private normalizeRequestBodyObject(
    operationId: string,
    requestBody?: RequestBody | Reference,
  ) {
    if (!requestBody) {
      return undefined
    }

    requestBody = this.loader.requestBody(requestBody)

    return {
      description: requestBody.description,
      required: requestBody.required ?? true,
      content: this.normalizeMediaTypes(
        requestBody.content,
        operationId,
        "RequestBody",
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
              response.content,
              operationId,
              `${statusCode}Response`,
            ),
          },
        ]
      }),
    )
  }

  private normalizeParameters(
    parameters: (Parameter | Reference)[] = [],
  ): IRParameter[] {
    return parameters
      .map((it) => this.loader.parameter(it))
      .map(normalizeParameterObject)
  }

  private normalizeOperationId(
    operationId: string | undefined,
    method: string,
    route: string,
  ) {
    if (operationId) {
      return _.camelCase(operationId)
    }

    return _.camelCase([method, ...route.split("/")].join("-"))
  }

  private normalizeMediaTypes(
    mediaTypes: {
      [mediaType: string]: MediaType
    } = {},
    operationId: string,
    suffix: "RequestBody" | `${string}Response`,
  ) {
    return Object.fromEntries(
      Object.entries(mediaTypes)
        // Sometimes people pass `{}` as the MediaType for 204 responses, filter these out
        .filter(([, mediaType]) => Boolean(mediaType.schema))
        .map(([contentType, mediaType]) => {
          return [
            contentType,
            {
              schema: this.normalizeMediaTypeSchema(
                operationId,
                contentType,
                mediaType.schema,
                suffix,
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
    suffix: string,
  ): MaybeIRModel {
    // TODO: omit media type when only one possible?
    const syntheticName = `${operationId}${mediaTypeToIdentifier(
      mediaType,
    )}${suffix}`
    const result = normalizeSchemaObject(schema)

    const shouldCreateVirtualType =
      this.config.extractInlineSchemas &&
      !isRef(result) &&
      (result.type === "object" ||
        (result.type === "array" &&
          !isRef(result.items) &&
          result.items.type === "object"))

    return shouldCreateVirtualType
      ? this.loader.addVirtualType(operationId, syntheticName, result)
      : result
  }
}

function normalizeParameterObject(parameterObject: Parameter): IRParameter {
  return {
    name: parameterObject.name,
    in: parameterObject.in,
    schema: normalizeSchemaObject(parameterObject.schema),
    description: parameterObject.description,
    required: parameterObject.required ?? false,
    deprecated: parameterObject.deprecated ?? false,
    allowEmptyValue: parameterObject.allowEmptyValue ?? false,
  }
}

function normalizeSchemaObject(schemaObject: Schema): IRModel
function normalizeSchemaObject(schemaObject: Reference): IRRef
function normalizeSchemaObject(
  schemaObject: Schema | Reference,
): IRModel | IRRef
function normalizeSchemaObject(
  schemaObject: Schema | Reference,
): IRModel | IRRef {
  if (isRef(schemaObject)) {
    return schemaObject satisfies IRRef
  }

  // TODO: HACK: translates a type array into a a oneOf - unsure if this makes sense,
  //             or is the cleanest way to do it. I'm fairly sure this will work fine
  //             for most things though.
  if (Array.isArray(schemaObject.type)) {
    const nullable = Boolean(schemaObject.type.find((it) => it === "null"))
    return normalizeSchemaObject({
      oneOf: schemaObject.type
        .filter((it) => it !== "null")
        .map((it) =>
          normalizeSchemaObject({
            ...schemaObject,
            type: it,
            nullable,
          }),
        ),
    })
  }

  const base: IRModelBase = {
    nullable: schemaObject.nullable || false,
    readOnly: schemaObject.readOnly || false,
  }

  switch (schemaObject.type) {
    case undefined:
    case "null": // TODO: HACK to support OA 3.1
    case "object": {
      if (deepEqual(schemaObject, {type: "object"})) {
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
        nullable: base.nullable || schemaObject.type === "null",
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
        logger.warn("array object missing items property", schemaObject)
        items = {$ref: generationLib.UnknownObject$Ref}
      }

      return {
        ...base,
        type: schemaObject.type,
        items: normalizeSchemaObject(items),
      } satisfies IRModelArray
    }
    case "number":
    case "integer": {
      const schemaObjectEnum = (schemaObject.enum ?? []) as any[]
      const nullable = schemaObjectEnum.includes(null)
      const enumValues = schemaObjectEnum.filter((it): it is number =>
        Number.isFinite(it),
      )

      return {
        ...base,
        nullable: nullable || base.nullable,
        type: "number",
        // todo: https://github.com/mnahkies/openapi-code-generator/issues/51
        format: schemaObject.format,
        enum: enumValues.length ? enumValues : undefined,
        minimum: schemaObject.minimum,
        maximum: schemaObject.maximum,
      } satisfies IRModelNumeric
    }
    case "string": {
      const schemaObjectEnum = (schemaObject.enum ?? []) as any[]
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
      } satisfies IRModelString
    }
    case "boolean":
      return {
        ...base,
        type: schemaObject.type,
      } satisfies IRModelBoolean
    default:
      throw new Error(`unsupported type '${schemaObject.type}'`)
  }

  function normalizeProperties(
    properties: Schema["properties"] = {},
  ): Record<string, MaybeIRModel> {
    return Object.entries(properties ?? {}).reduce(
      (result, [name, schemaObject]) => {
        result[name] = normalizeSchemaObject(schemaObject)
        return result
      },
      {} as Record<string, MaybeIRModel>,
    )
  }

  function normalizeAdditionalProperties(
    additionalProperties: Schema["additionalProperties"] = false,
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

    return normalizeSchemaObject(additionalProperties)
  }

  function normalizeAllOf(allOf: Schema["allOf"] = []): MaybeIRModel[] {
    return allOf.map(normalizeSchemaObject)
  }

  function normalizeOneOf(oneOf: Schema["oneOf"] = []): MaybeIRModel[] {
    return oneOf.map(normalizeSchemaObject)
  }

  function normalizeAnyOf(anyOf: Schema["anyOf"] = []): MaybeIRModel[] {
    return anyOf
      .filter((it) => {
        // todo: Github spec uses some complex patterns with anyOf in some situations that aren't well supported. Eg:
        //       anyOf: [ {required: ["bla"]}, {required: ["foo"]} ] in addition to top-level schema, which looks like
        //       it's intended to indicate that at least one of the objects properties must be set (consider it a
        //       Omit<Partial<Thing>, EmptyObject> )
        return isRef(it) || Boolean(it.type)
      })
      .map(normalizeSchemaObject)
  }
}
