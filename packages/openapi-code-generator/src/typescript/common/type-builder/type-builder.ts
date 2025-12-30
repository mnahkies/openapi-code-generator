import type {ISchemaProvider} from "../../../core/input"
import type {CompilerOptions} from "../../../core/loaders/tsconfig.loader"
import {logger} from "../../../core/logger"
import type {Reference} from "../../../core/openapi-types"
import type {MaybeIRModel} from "../../../core/openapi-types-normalized"
import {getNameFromRef, isRef} from "../../../core/openapi-utils"
import {hasSingleElement} from "../../../core/utils"
import {CompilationUnit, type ICompilable} from "../compilation-units"
import type {ImportBuilder} from "../import-builder"
import {
  array,
  coerceToString,
  intersect,
  object,
  objectProperty,
  quotedStringLiteral,
  union,
} from "../type-utils"
import {buildExport} from "../typescript-common"

const staticTypes = {
  EmptyObject: "export type EmptyObject = { [key: string]: never }",
  // TODO: results in  TS4023: Exported variable '<schema>' has or is using name '_brand' from external module "<path>" but cannot be named.
  // Brand: "export const _brand = Symbol.for('brand')",
  UnknownEnumStringValue:
    "export type UnknownEnumStringValue = (string & {_brand: 'unknown enum string value'})",
  UnknownEnumNumberValue:
    "export type UnknownEnumNumberValue = (number & {_brand: 'unknown enum number value'})",
}

type StaticType = keyof typeof staticTypes

export type TypeBuilderConfig = {
  allowAny: boolean
}

type IRTypeIntersection = {type: "type-intersection"; types: IRType[]}
type IRTypeUnion = {type: "type-union"; types: IRType[]}
type IRTypeOther = string

type IRType = IRTypeIntersection | IRTypeUnion | IRTypeOther

/**
 * Recursively looks for opportunities to merge / flatten intersections and unions
 */
function normalizeIRType(type: IRType): IRType {
  if (typeof type === "string") {
    return type
  }

  if (type.type === "type-intersection" || type.type === "type-union") {
    const flattened: IRType[] = []
    const seen = new Set<string>()
    for (const innerType of type.types) {
      const normalized = normalizeIRType(innerType)

      if (typeof normalized !== "string" && normalized.type === type.type) {
        flattened.push(...normalized.types)
      } else if (typeof normalized !== "string") {
        flattened.push(normalized)
      } else if (!seen.has(normalized)) {
        flattened.push(normalized)
        seen.add(normalized)
      }
    }

    if (hasSingleElement(flattened)) {
      return flattened[0]
    }

    return {
      type: type.type,
      types: flattened,
    }
  }

  /* istanbul ignore next */
  throw new Error(
    `normalizeIRType: unknown IRType '${JSON.stringify(type satisfies never)}'`,
  )
}

/**
 * Converts IRType to a typescript type
 */
function toTs(type: IRType): string {
  if (typeof type === "string") {
    return type
  } else if (type.type === "type-union") {
    return union(...type.types.map(toTs))
  } else if (type.type === "type-intersection") {
    return intersect(...type.types.map(toTs))
  }

  /* istanbul ignore next */
  throw new Error(`toTs: unknown type '${JSON.stringify(type)}'`)
}

export class TypeBuilder implements ICompilable {
  private constructor(
    public readonly filename: string,
    private readonly input: ISchemaProvider,
    private readonly compilerOptions: CompilerOptions,
    private readonly config: TypeBuilderConfig,
    private readonly referenced = new Set<string>(),
    private readonly referencedStaticTypes = new Set<StaticType>(),
    private readonly imports?: ImportBuilder,
    private readonly parent?: TypeBuilder,
  ) {}

  static async fromSchemaProvider(
    filename: string,
    schemaProvider: ISchemaProvider,
    compilerOptions: CompilerOptions,
    typeBuilderConfig: TypeBuilderConfig,
  ): Promise<TypeBuilder> {
    return new TypeBuilder(
      filename,
      schemaProvider,
      compilerOptions,
      typeBuilderConfig,
    )
  }

  withImports(imports: ImportBuilder): TypeBuilder {
    return new TypeBuilder(
      this.filename,
      this.input,
      this.compilerOptions,
      this.config,
      new Set(),
      new Set(),
      imports,
      this,
    )
  }

  getTypeNameFromRef(reference: Reference) {
    return getNameFromRef(reference, "t_")
  }

  protected add({$ref}: Reference): string {
    this.parent?.add({$ref})
    this.referenced.add($ref)

    const name = this.getTypeNameFromRef({$ref})

    this.imports?.addSingle(name, this.filename, true)

    return name
  }

  protected addStaticType(name: StaticType): string {
    this.parent?.addStaticType(name)
    this.referencedStaticTypes.add(name)
    this.imports?.addSingle(name, this.filename, true)

    return name
  }

  private staticTypes(): string[] {
    return Array.from(this.referencedStaticTypes.values())
      .sort()
      .map((it) => staticTypes[it])
  }

  toString(): string {
    logger.time(`generate ${this.filename}`)

    const generate = () => {
      return this.staticTypes().concat(
        Array.from(this.referenced.values())
          .sort()
          .map(($ref) => this.generateModelFromRef($ref)),
      )
    }

    // Super lazy way of discovering sub-references for generation easily...
    // could obviously be optimized but in most cases is plenty fast enough.
    let previous = generate()
    let next = generate()

    while (previous.length !== next.length) {
      previous = next
      next = generate()
    }

    return next.join("\n\n")
  }

  private generateModelFromRef($ref: string): string {
    const name = this.getTypeNameFromRef({$ref})
    const schemaObject = this.input.schema({$ref})

    return buildExport({
      name,
      value: this.schemaObjectToType(schemaObject),
      kind: "type",
    })
  }

  readonly schemaObjectToType = (schemaObject: MaybeIRModel) => {
    const result = this.schemaObjectToTypes(schemaObject)
    const normalized = normalizeIRType(result)

    return toTs(normalized)
  }

  private readonly schemaObjectToTypes = (
    schemaObject: MaybeIRModel,
  ): IRType => {
    if (isRef(schemaObject)) {
      return this.add(schemaObject)
    }

    const result: IRType[] = []

    switch (schemaObject.type) {
      case "intersection": {
        result.push({
          type: "type-intersection",
          types: schemaObject.schemas.flatMap(this.schemaObjectToTypes),
        })
        break
      }

      case "union": {
        result.push({
          type: "type-union",
          types: schemaObject.schemas.flatMap(this.schemaObjectToTypes),
        })
        break
      }

      case "array": {
        result.push(array(this.schemaObjectToType(schemaObject.items)))
        break
      }

      case "boolean": {
        if (schemaObject.enum) {
          result.push(...schemaObject.enum)
        } else {
          result.push("boolean")
        }
        break
      }

      case "string": {
        if (schemaObject.enum) {
          result.push(...schemaObject.enum.map(quotedStringLiteral))

          if (schemaObject["x-enum-extensibility"] === "open") {
            result.push(this.addStaticType("UnknownEnumStringValue"))
          }
        } else if (
          schemaObject.format === "binary"
          // todo: byte is base64 encoded string, https://spec.openapis.org/registry/format/byte.html
          // || schemaObject.format === "byte"
        ) {
          result.push("Blob")
        } else {
          result.push("string")
        }
        break
      }

      case "number": {
        // todo: support bigint as string, https://github.com/mnahkies/openapi-code-generator/issues/51

        if (schemaObject.enum) {
          result.push(...schemaObject.enum.map(coerceToString))

          if (schemaObject["x-enum-extensibility"] === "open") {
            result.push(this.addStaticType("UnknownEnumNumberValue"))
          }
        } else {
          result.push("number")
        }
        break
      }

      case "object": {
        const properties = Object.entries(schemaObject.properties)
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([name, definition]) => {
            const isRequired = schemaObject.required.some((it) => it === name)
            const type = this.schemaObjectToType(definition)

            // ensure compatibility with `exactOptionalPropertyTypes` compiler option
            // https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes
            const exactOptionalPropertyTypes =
              !isRequired && this.compilerOptions.exactOptionalPropertyTypes

            return objectProperty({
              name,
              type: exactOptionalPropertyTypes
                ? union(type, "undefined")
                : type,
              isReadonly: false,
              isRequired,
            })
          })

        if (schemaObject.additionalProperties) {
          const key = this.schemaObjectToTypes(
            schemaObject.additionalProperties.key,
          )
          const value = this.schemaObjectToType(
            schemaObject.additionalProperties.value,
          )
          properties.push(`[key: ${key}]: ${union(value, "undefined")}`)
        }

        const emptyObject = this.isEmptyObject(schemaObject)
          ? this.addStaticType("EmptyObject")
          : ""

        result.push(object(properties), emptyObject)
        break
      }

      case "any": {
        return this.config.allowAny ? "any" : "unknown"
      }

      case "never": {
        result.push("never")
        break
      }

      case "null": {
        throw new Error(
          "unreachable - 'null' types should be normalized out by SchemaNormalizer",
        )
      }

      case "record": {
        result.push(
          `Record<${this.schemaObjectToType(schemaObject.key)}, ${this.schemaObjectToType(schemaObject.value)}>`,
        )
        break
      }

      default: {
        throw new Error(
          `unsupported type '${JSON.stringify(schemaObject satisfies never, undefined, 2)}'`,
        )
      }
    }

    if (schemaObject.nullable) {
      result.push("null")
    }

    return hasSingleElement(result)
      ? result[0]
      : {type: "type-union", types: result}
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }

  /**
   * @deprecated
   */
  isEmptyObject(schemaObject: MaybeIRModel): boolean {
    const dereferenced = this.input.schema(schemaObject)

    return (
      dereferenced.type === "object" &&
      dereferenced.additionalProperties === undefined &&
      Object.keys(dereferenced.properties).length === 0
    )
  }
}
