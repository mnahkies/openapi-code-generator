import {MaybeIRModel} from "../../core/openapi-types-normalized"
import {Input} from "../../core/input"
import {Reference} from "../../core/openapi-types"
import {getNameFromRef, isRef} from "../../core/openapi-utils"
import {ImportBuilder} from "./import-builder"
import {
  array,
  intersect,
  object,
  objectProperty,
  quotedValue,
  toString,
  union,
} from "./type-utils"

export class TypeBuilder {
  private constructor(
    public readonly filename: string,
    private readonly input: Input,
    private readonly referenced = new Set<string>(),
    private readonly imports?: ImportBuilder
  ) {
  }

  withImports(imports: ImportBuilder): TypeBuilder {
    return new TypeBuilder(this.filename, this.input, this.referenced, imports)
  }

  private add({$ref}: Reference): string {
    this.referenced.add($ref)

    const name = getNameFromRef({$ref}, "t_")

    if (this.imports) {
      this.imports.addSingle(name, this.filename)
    }

    return name
  }

  toString(): string {
    const generate = () =>
      Array.from(this.referenced.values())
        .sort()
        .map(($ref) => this.generateModelFromRef($ref))

    // Super lazy way of discovering sub-references for generation easily...
    // could obviously be optimized but in most cases is plenty fast enough.
    let previous = generate()
    let next = generate()

    while (previous.length != next.length) {
      previous = next
      next = generate()
    }

    return next.join("\n\n")
  }

  private generateModelFromRef($ref: string): string {
    const name = getNameFromRef({$ref}, "t_")
    const schemaObject = this.input.schema({$ref})

    return `export type ${name} = ${this.schemaObjectToType(schemaObject)}`
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
          result.push(...(schemaObject.enum?.map(quotedValue) ?? ["string"]))
          break
        }

        case "number": {
          // todo support bigint as string
          result.push(...(schemaObject.enum?.map(toString) ?? ["number"]))
          break
        }

        case "object": {
          const properties = Object.entries(schemaObject.properties)
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([name, definition]) => {
              const isRequired = schemaObject.required.some((it) => it === name)
              const type = this.schemaObjectToType(definition)

              const isReadonly = isRef(definition) ? false : definition.readOnly

              return objectProperty({
                name,
                type,
                isReadonly,
                isRequired,
              })
            })

          // TODO better support
          const additionalProperties =
            schemaObject.additionalProperties
              ? "[key: string]: unknown"
              : ""

          const emptyObject = !additionalProperties && properties.length === 0 ? "[key: string]:  never" : ""

          result.push(object([...properties, additionalProperties, emptyObject]))
          break
        }

        default: {
          throw new Error(
            `unsupported type '${JSON.stringify(schemaObject, undefined, 2)}'`
          )
        }
      }
    }

    if (schemaObject.nullable) {
      result.push("null")
    }

    return result
  }

  static fromInput(filename: string, input: Input): TypeBuilder {
    return new TypeBuilder(filename, input)
  }
}
