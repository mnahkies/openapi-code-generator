import type {Input} from "../../core/input"
import type {CompilerOptions} from "../../core/loaders/tsconfig.loader"
import {logger} from "../../core/logger"
import type {Reference} from "../../core/openapi-types"
import type {MaybeIRModel} from "../../core/openapi-types-normalized"
import {getTypeNameFromRef, isRef} from "../../core/openapi-utils"
import {CompilationUnit, type ICompilable} from "./compilation-units"
import type {ImportBuilder} from "./import-builder"
import {
  array,
  coerceToString,
  intersect,
  object,
  objectProperty,
  quotedStringLiteral,
  union,
} from "./type-utils"
import {buildExport} from "./typescript-common"

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

export class TypeBuilder implements ICompilable {
  private constructor(
    public readonly filename: string,
    private readonly input: Input,
    private readonly compilerOptions: CompilerOptions,
    private readonly config: TypeBuilderConfig,
    private readonly referenced = new Set<string>(),
    private readonly referencedStaticTypes = new Set<StaticType>(),
    private readonly imports?: ImportBuilder,
    private readonly parent?: TypeBuilder,
  ) {}

  static async fromInput(
    filename: string,
    input: Input,
    compilerOptions: CompilerOptions,
    typeBuilderConfig: TypeBuilderConfig,
  ): Promise<TypeBuilder> {
    return new TypeBuilder(filename, input, compilerOptions, typeBuilderConfig)
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

  protected add({$ref}: Reference): string {
    this.parent?.add({$ref})
    this.referenced.add($ref)

    const name = getTypeNameFromRef({$ref})

    this.imports?.addSingle(name, this.filename)

    return name
  }

  protected addStaticType(name: StaticType): string {
    this.parent?.addStaticType(name)
    this.referencedStaticTypes.add(name)
    this.imports?.addSingle(name, this.filename)

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
    const name = getTypeNameFromRef({$ref})
    const schemaObject = this.input.schema({$ref})

    return buildExport({
      name,
      value: this.schemaObjectToType(schemaObject),
      kind: "type",
    })
  }

  readonly schemaObjectToType = (schemaObject: MaybeIRModel) => {
    const result = this.schemaObjectToTypes(schemaObject)
    return union(result)
  }

  readonly schemaObjectToTypes = (schemaObject: MaybeIRModel): string[] => {
    if (isRef(schemaObject)) {
      return [this.add(schemaObject)]
    }

    const result: string[] = []

    if (schemaObject.type === "object" && schemaObject.allOf.length) {
      result.push(intersect(schemaObject.allOf.map(this.schemaObjectToType)))
    }

    if (schemaObject.type === "object" && schemaObject.oneOf.length) {
      result.push(...schemaObject.oneOf.flatMap(this.schemaObjectToTypes))
    }

    if (schemaObject.type === "object" && schemaObject.anyOf.length) {
      result.push(...schemaObject.anyOf.flatMap(this.schemaObjectToTypes))
    }

    if (result.length === 0) {
      switch (schemaObject.type) {
        case "array": {
          result.push(array(this.schemaObjectToType(schemaObject.items)))
          break
        }

        case "boolean": {
          result.push("boolean")
          break
        }

        case "string": {
          if (schemaObject.enum) {
            result.push(...schemaObject.enum.map(quotedStringLiteral))

            if (schemaObject["x-enum-extensibility"] === "open") {
              result.push(this.addStaticType("UnknownEnumStringValue"))
            }
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

        case "any": {
          result.push(this.config.allowAny ? "any" : "unknown")
          break
        }

        case "object": {
          const properties = Object.entries(schemaObject.properties)
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([name, definition]) => {
              const isRequired = schemaObject.required.some((it) => it === name)
              const type = this.schemaObjectToType(definition)

              const isReadonly = isRef(definition) ? false : definition.readOnly

              // ensure compatibility with `exactOptionalPropertyTypes` compiler option
              // https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes
              const exactOptionalPropertyTypes =
                !isRequired && this.compilerOptions.exactOptionalPropertyTypes

              return objectProperty({
                name,
                type: exactOptionalPropertyTypes
                  ? union(type, "undefined")
                  : type,
                isReadonly,
                isRequired,
              })
            })

          // todo: https://github.com/mnahkies/openapi-code-generator/issues/44
          const additionalPropertiesType = schemaObject.additionalProperties
            ? typeof schemaObject.additionalProperties === "boolean"
              ? this.config.allowAny
                ? "any"
                : "unknown"
              : this.schemaObjectToType(schemaObject.additionalProperties)
            : ""

          const additionalProperties = additionalPropertiesType
            ? `[key: string]: ${union(additionalPropertiesType, "undefined")}`
            : ""

          const emptyObject =
            schemaObject.additionalProperties === false &&
            properties.length === 0
              ? this.addStaticType("EmptyObject")
              : ""

          properties.push(additionalProperties)

          result.push(object(properties), emptyObject)
          break
        }

        default: {
          throw new Error(
            `unsupported type '${JSON.stringify(schemaObject, undefined, 2)}'`,
          )
        }
      }
    }

    if (schemaObject.nullable) {
      result.push("null")
    }

    return result
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.toString())
  }
}
