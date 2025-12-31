import {isNonEmptyArray} from "@nahkies/typescript-common-runtime/types"
import {generationLib} from "../generation-lib"
import type {InputConfig} from "../input"
import {logger} from "../logger"
import type {
  Reference,
  Schema,
  SchemaNumber,
  SchemaObject,
  SchemaString,
} from "../openapi-types"
import type {
  IRModel,
  IRModelAny,
  IRModelArray,
  IRModelBase,
  IRModelBoolean,
  IRModelIntersection,
  IRModelNumeric,
  IRModelObject,
  IRModelRecord,
  IRModelString,
  IRModelUnion,
  IRRef,
  MaybeIRModel,
} from "../openapi-types-normalized"
import {isRef} from "../openapi-utils"

export class SchemaNormalizer {
  constructor(readonly config: InputConfig) {}

  public isNormalized(schema: Schema | IRModel): schema is IRModel {
    return schema && Reflect.get(schema, "isIRModel")
  }

  private hasPropertiesOrComposition(schema: SchemaObject): boolean {
    return Boolean(
      schema.allOf?.length ||
        schema.oneOf?.length ||
        schema.anyOf?.length ||
        Object.keys(schema.properties ?? {}).length > 0,
    )
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
      default: schemaObject.default,
      "x-internal-preprocess": schemaObject["x-internal-preprocess"],
    }

    switch (schemaObject.type) {
      case undefined: {
        // hack: detect missing `type` but `enum` provided, implying a `type`
        if (schemaObject.enum?.length) {
          if (schemaObject.enum?.every((it) => typeof it === "number")) {
            return self.normalize({...schemaObject, type: "number"})
          }
          if (schemaObject.enum?.every((it) => typeof it === "boolean")) {
            return self.normalize({...schemaObject, type: "boolean"})
          }
          return self.normalize({...schemaObject, type: "string"})
        }

        // `{}` or `{description: "something"}` should translate to `any`
        if (
          !this.hasPropertiesOrComposition(schemaObject) &&
          schemaObject.additionalProperties === undefined
        ) {
          return self.normalize({...schemaObject, type: "any"})
        }

        return self.normalize({...schemaObject, type: "object"})
      }
      case "null": // TODO: HACK to support OA 3.1
      case "object": {
        if (
          schemaObject.type !== "null" &&
          !this.hasPropertiesOrComposition(schemaObject)
        ) {
          if (
            schemaObject.additionalProperties === undefined ||
            schemaObject.additionalProperties === true
          ) {
            return this.record(base, {type: "string"}, {type: "any"})
          } else if (schemaObject.additionalProperties === false) {
            return this.record(base, {type: "string"}, {type: "never"})
          } else {
            return this.record(
              base,
              {type: "string"},
              schemaObject.additionalProperties,
            )
          }
        }

        const properties = normalizeProperties(schemaObject.properties)

        const hasNull =
          hasATypeNull(schemaObject.allOf) ||
          hasATypeNull(schemaObject.oneOf) ||
          hasATypeNull(schemaObject.anyOf)

        // TODO: HACK
        const nullable =
          base.nullable || schemaObject.type === "null" || hasNull

        const required = (schemaObject.required ?? []).filter((it) => {
          const include = Reflect.has(properties, it)

          if (!include) {
            logger.warn(
              `skipping required property '${it}' not present on object`,
            )
          }

          return include
        })

        const additionalProperties = self.normalizeAdditionalProperties(
          {...base, nullable},
          schemaObject,
        )

        const result = {
          ...base,
          nullable,
          type: "object",
          required,
          properties,
          additionalProperties,
        } satisfies IRModelObject

        const allOf = this.normalizeComposition(
          schemaObject.allOf,
          schemaObject,
        )
        const oneOf = this.normalizeComposition(
          schemaObject.oneOf,
          schemaObject,
        )
        const anyOf = this.normalizeComposition(
          schemaObject.anyOf,
          schemaObject,
        )

        const isPartOfComposition = Boolean(
          allOf.length || oneOf.length || anyOf.length,
        )

        if (!isPartOfComposition) {
          return result
        }

        const hasOwnProperties = Boolean(
          additionalProperties || Object.keys(properties).length > 0,
        )

        const maybeIntersection = this.intersection(
          {...base, nullable},
          hasOwnProperties ? [...allOf, result] : allOf,
        )
        const maybeUnion = this.union({...base, nullable}, [...oneOf, ...anyOf])

        if (maybeIntersection && maybeUnion) {
          return this.intersection({...base, nullable}, [
            maybeIntersection,
            maybeUnion,
          ])
        }

        if (maybeIntersection && !maybeUnion) {
          return maybeIntersection
        }

        if (maybeUnion && !maybeIntersection) {
          return maybeUnion
        }

        throw new Error(
          `unreachable: every composite object must be composed either/both an intersection/union`,
        )
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

    function hasATypeNull(arr?: (Schema | Reference)[]) {
      return Boolean(
        arr?.find((it) => {
          return !isRef(it) && it.type === "null"
        }),
      )
    }
  }

  private normalizeComposition(
    items: (Schema | Reference)[] = [],
    parent: SchemaObject,
  ): MaybeIRModel[] {
    return items
      .map((it) => {
        if (isRef(it) || (it.type !== undefined && it.type !== "object")) {
          return it
        }

        if (it.required?.length) {
          /**
           * HACK: A pattern observed in the wild is using oneOf to alter the required status of a property:
           *
           * type: object
           * properties:
           *   foo:
           *     type: string
           *   bar:
           *     type: string
           * oneOf:
           *   - required: ["foo"]
           *   - required: ["bar"]
           *
           * Eg: to indicate mutual exclusivity.
           *
           * This aims to support that approach, but doing a "look up" of the parents property definition, and
           * copying it to the oneOf's definitions if it's missing.
           *
           * TODO:
           * - doesn't follow allOf / $ref / recurse
           */
          const properties = it.required.reduce(
            (acc, name) => {
              const fromParent = parent.properties?.[name]

              if (!acc[name] && fromParent) {
                acc[name] = fromParent
              }

              return acc
            },
            {...it.properties},
          )

          if (Object.keys(properties).length) {
            return {
              type: "object",
              ...it,
              properties,
            } as SchemaObject
          }
        }

        return it
      })
      .filter((it) => isRef(it) || it.type !== "null")
      .map((it) => this.normalize(it))
  }

  private normalizeAdditionalProperties(
    base: IRModelBase,
    schema: SchemaObject,
  ): IRModelRecord | undefined {
    const additionalProperties = schema.additionalProperties

    if (additionalProperties === undefined) {
      return undefined
    }

    if (additionalProperties === false) {
      if (this.hasPropertiesOrComposition(schema)) {
        return undefined
      }

      return this.record(base, {type: "string"}, {type: "never"})
    }

    if (additionalProperties === true) {
      return this.record(base, {type: "string"}, {type: "any"})
    }

    return this.record(base, {type: "string"}, additionalProperties)
  }

  private record(
    base: IRModelBase,
    key: SchemaString | SchemaNumber,
    value: Schema | Reference,
  ): IRModelRecord {
    return {
      ...base,
      type: "record",
      key: this.normalize(key) as IRModelString,
      value: this.normalize(value) as IRModelAny,
    }
  }

  private intersection(base: IRModelBase, schemas: []): undefined
  private intersection(
    base: IRModelBase,
    schemas: [MaybeIRModel],
  ): MaybeIRModel | IRModelIntersection
  private intersection(
    base: IRModelBase,
    schemas: [MaybeIRModel, ...MaybeIRModel[]],
  ): IRModelIntersection
  private intersection(
    base: IRModelBase,
    schemas: [] | MaybeIRModel[] | [MaybeIRModel, ...MaybeIRModel[]],
  ): undefined | MaybeIRModel | IRModelIntersection
  private intersection(
    base: IRModelBase,
    schemas: [] | MaybeIRModel[] | [MaybeIRModel, ...MaybeIRModel[]],
  ): undefined | MaybeIRModel | IRModelIntersection {
    if (isNonEmptyArray(schemas)) {
      if (schemas.length === 1) {
        if (base.nullable) {
          return {...base, type: "intersection", schemas}
        }
        return schemas[0]
      }

      return {
        ...base,
        type: "intersection",
        schemas,
      }
    }

    return undefined
  }

  private union(
    base: IRModelBase,
    schemas: MaybeIRModel[],
  ): MaybeIRModel | IRModelUnion | undefined {
    // (A|B)|(C|D) is the same as (A|B|C|D)
    // todo: merge repeated in-line schemas
    // biome-ignore lint/style/noParameterAssign: ignore
    schemas = schemas.flatMap((it) =>
      !isRef(it) && it.type === "union" ? it.schemas : [it],
    )

    if (isNonEmptyArray(schemas)) {
      if (schemas.length === 1) {
        if (base.nullable) {
          return {...base, type: "union", schemas}
        }
        return schemas[0]
      }

      return {
        ...base,
        type: "union",
        schemas,
      }
    }

    return undefined
  }
}
