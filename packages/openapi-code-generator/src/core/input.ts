import _ from "lodash"
import {
  MediaType,
  Operation,
  Parameter,
  Reference,
  RequestBody,
  Responses,
  Schema,
} from "./openapi-types"
import {OpenapiLoader} from "./openapi-loader"
import {generationLib} from "./generation-lib"
import {isHttpMethod} from "./utils"
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
  IRRequestBody,
  IRResponse,
  MaybeIRModel,
} from "./openapi-types-normalized"
import {isRef} from "./openapi-utils"
import {logger} from "./logger"

export class Input {
  constructor(
    readonly loader: OpenapiLoader,
  ) {
  }

  allSchemas(): Record<string, IRModel> {
    const schemas = this.loader.entryPoint.components?.schemas ?? {}
    return Object.fromEntries(Object.entries(schemas).map(([name, maybeSchema]) => {
      return [name, this.schema(normalizeSchemaObject(maybeSchema))]
    }))
  }

  allOperations(): IROperation[] {
    const result: IROperation[] = []

    // eslint-disable-next-line prefer-const
    for (let [route, paths] of Object.entries(this.loader.entryPoint.paths ?? [])) {
      paths = this.loader.paths(paths)

      const params = this.normalizeParameters(paths.parameters)

      const additionalAttributes = _.pickBy(paths, (_, key) => key !== "parameters" && !isHttpMethod(key)) as any
      const methods = _.pickBy(paths, (_, it) => isHttpMethod(it)) as Record<string, Operation | Reference>

      // eslint-disable-next-line prefer-const
      for (let [method, definition] of Object.entries(methods)) {
        if (!definition) {
          continue
        }

        definition = this.loader.operation(definition)

        result.push({
          ...additionalAttributes,
          route,
          method: method.toUpperCase() as IROperation["method"],
          parameters: params.concat(this.normalizeParameters(definition.parameters)),
          operationId: this.normalizeOperationId(definition.operationId, method, route),
          tags: definition.tags ?? [],
          requestBody: this.normalizeRequestBodyObject(definition.requestBody),
          responses: this.normalizeResponsesObject(definition.responses),
          summary: definition.summary,
          description: definition.description,
          deprecated: definition.deprecated ?? false,
        })
      }
    }

    return result
  }

  operationsByFirstTag(): Record<string, IROperation[]> {
    return this.groupedOperations(operation => operation.tags[0])
  }

  operationsByFirstSlug(): Record<string, IROperation[]> {
    return this.groupedOperations(operation => {
      return (operation.route
        .split("/")
        .find(it => !!it) ?? "")
        .replace(/[{}]*/g, "")
    })
  }

  groupedOperations(groupBy: (operation: IROperation) => string | undefined): Record<string, IROperation[]> {
    return this.allOperations().reduce((result, operation) => {
      const key = groupBy(operation)
      if (key) {
        result[key] = result[key] ?? []
        result[key].push(operation)
      } else {
        logger.warn("no group criteria for operation, skipping", operation)
      }

      return result
    }, {} as Record<string, IROperation[]>)
  }

  schema(maybeRef: MaybeIRModel): IRModel {
    const schema = this.loader.schema(maybeRef)
    return normalizeSchemaObject(schema) as IRModel
  }

  private normalizeRequestBodyObject(requestBody?: RequestBody | Reference) {
    if (!requestBody) {
      return undefined
    }

    return normalizeRequestBodyObject(this.loader.requestBody(requestBody))
  }

  private normalizeResponsesObject(responses?: Responses): {[statusCode: string]: IRResponse} | undefined {
    if (!responses) {
      return undefined
    }

    return Object.fromEntries(Object.entries(responses).map(([statusCode, response]) => {
      response = response ? this.loader.response(response) : {}

      return [
        statusCode,
        {
          headers: {},
          description: response.description,
          content: normalizeMediaType(response.content),
        },
      ]
    }))
  }

  private normalizeParameters(parameters: (Parameter | Reference)[] = []): IRParameter[] {
    return parameters
      .map((it) => this.loader.parameter(it))
      .map(normalizeParameterObject)
  }

  private normalizeOperationId(operationId: string | undefined, method: string, route: string) {
    if (operationId) {
      return _.camelCase(operationId)
    }

    return _.camelCase([method, ...route.split("/")].join("-"))
  }
}

function normalizeRequestBodyObject(requestBodyObject: RequestBody): IRRequestBody | undefined {
  return {
    description: requestBodyObject.description,
    required: requestBodyObject.required ?? true,
    content: normalizeMediaType(requestBodyObject.content),
  }
}

function normalizeMediaType(mediaTypes: {[contentType: string]: MediaType} = {}) {
  return Object.fromEntries(Object.entries(mediaTypes)
    // Sometimes people pass `{}` as the MediaType for 204 responses, filter these out
    .filter(([, mediaType]) => Boolean(mediaType.schema))
    .map(([contentType, mediaType]) => {
    return [
      contentType,
      {
        schema: normalizeSchemaObject(mediaType.schema),
        encoding: mediaType.encoding,
      },
    ]
  }))
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

function normalizeSchemaObject(schemaObject: Schema | Reference): MaybeIRModel {
  if (isRef(schemaObject)) {
    return schemaObject satisfies IRRef
  }

  const base: IRModelBase = {
    nullable: schemaObject.nullable || false,
    readOnly: schemaObject.readOnly || false,
  }

  switch (schemaObject.type) {
    case undefined:
    case "object": {
      const properties = normalizeProperties(schemaObject.properties)
      const allOf = normalizeAllOf(schemaObject.allOf)
      const oneOf = normalizeOneOf(schemaObject.oneOf)
      const anyOf = normalizeAnyOf(schemaObject.anyOf)

      const required = (schemaObject.required ?? []).filter(it => {
        const include = Reflect.has(properties, it)

        if (!include) {
          logger.warn("skipping required property not present on object")
        }

        return include
      })

      const additionalProperties = normalizeAdditionalProperties(schemaObject.additionalProperties)

      return {
        ...base,
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
      const enumValues = ((schemaObject.enum ?? []) as any[])
        .filter((it): it is number => isFinite(it))
      return {
        ...base,
        type: "number",
        // todo: https://github.com/mnahkies/openapi-code-generator/issues/51
        format: schemaObject.format as any,
        enum: enumValues.length ? enumValues : undefined,
      } satisfies IRModelNumeric
    }
    case "string": {
      const enumValues = ((schemaObject.enum ?? []) as any[])
        .map((it) => String(it))
      return {
        ...base,
        type: schemaObject.type,
        format: schemaObject.format as any,
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

  function normalizeProperties(properties: Schema["properties"] = {}): Record<string, MaybeIRModel> {
    return Object
      .entries(properties ?? {})
      .reduce((result, [name, schemaObject]) => {
        result[name] = normalizeSchemaObject(schemaObject)
        return result
      }, {} as Record<string, MaybeIRModel>)
  }

  function normalizeAdditionalProperties(additionalProperties: Schema["additionalProperties"] = false): boolean | MaybeIRModel {
    if (typeof additionalProperties === "boolean") {
      return additionalProperties
    }

    return normalizeSchemaObject(additionalProperties)
  }

  function normalizeAllOf(allOf: Schema["allOf"] = []): MaybeIRModel[] {
    return allOf
      .map(normalizeSchemaObject)
  }

  function normalizeOneOf(oneOf: Schema["oneOf"] = []): MaybeIRModel[] {
    return oneOf
      .map(normalizeSchemaObject)
  }

  function normalizeAnyOf(anyOf: Schema["anyOf"] = []): MaybeIRModel[] {
    return anyOf
      .filter(it => {
        // todo: Github spec uses some complex patterns with anyOf in some situations that aren't well supported. Eg:
        //       anyOf: [ {required: ["bla"]}, {required: ["foo"]} ] in addition to top-level schema, which looks like
        //       it's intended to indicate that at least one of the objects properties must be set (consider it a
        //       Omit<Partial<Thing>, EmptyObject> )
        return isRef(it) || Boolean(it.type)
      })
      .map(normalizeSchemaObject)
  }
}
