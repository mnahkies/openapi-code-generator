import {IRModelArray, MaybeIRModel} from "../../core/openapi-types-normalized"
import {Input} from "../../core/input"
import {Reference} from "../../core/openapi-types"
import {getNameFromRef, isRef} from "../../core/openapi-utils"
import {ImportBuilder} from "./import-builder"

export class TypeBuilder {

  private constructor(
    public readonly filename: string,
    private readonly input: Input,
    private readonly referenced = new Set<string>(),
    private readonly imports?: ImportBuilder) {
  }

  withImports(imports: ImportBuilder): TypeBuilder {
    return new TypeBuilder(
      this.filename,
      this.input,
      this.referenced,
      imports,
    )
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
    const generate = () => Array.from(this.referenced.values())
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

    return next
      .join("\n\n")
  }

  private generateModelFromRef($ref: string): string {
    const name = getNameFromRef({$ref}, "t_")
    const schemaObject = this.input.schema({$ref})

    // Arrays
    if (schemaObject.type === "array") {
      return `
    export type ${name} = ${this.itemsToType(schemaObject.items)}[];
    `
    }

    // Objects
    if (schemaObject.type === "object" || schemaObject.type === undefined) {
      return `
    export type ${name} = ${this.schemaObjectToType(schemaObject)}
    `
    }

    // Primitives
    return `
  export type ${name} = ${this.schemaObjectToType(schemaObject)}
  `
  }

  private readonly itemsToType = (items: IRModelArray["items"]): string => {

    if (isRef(items)) {
      return this.add(items)
    }

    // todo unofficial extension to openapi3 - items doesn't normally accept an array.
    if (Array.isArray(items)) {
      return `( ${items.map(this.schemaObjectToType).join(" | ")} )`
    }

    return `${this.schemaObjectToType(items)}`

  }

  readonly schemaObjectToType = (schemaObject: MaybeIRModel): string => {

    if (isRef(schemaObject)) {
      return this.add(schemaObject)
    }

    if (schemaObject.type === "object" && schemaObject.allOf.length) {
      return `(${schemaObject.allOf.map(this.schemaObjectToType).join(" & ")})`
    }

    if (schemaObject.type === "object" && schemaObject.oneOf.length) {
      return `(${schemaObject.oneOf.map(this.schemaObjectToType).join("\n | ")})`
    }

    switch (schemaObject.type) {
      case "array": {
        return `${this.itemsToType(schemaObject.items)}[]`
      }
      case "boolean": {
        return "boolean"
      }
      case "string": {
        const result = (schemaObject.enum?.filter(it => typeof it === "string")
          .map(it => `"${it}"`) ?? ["string"])

        if (schemaObject.nullable) {
          result.push("null")
        }

        return result.join(" | ")
      }
      case "number": {
        // todo support bigint as string
        if (Array.isArray(schemaObject.enum)) {
          return schemaObject.enum
            .map(it => `${it}`)
            .join(" | ")
        }

        return "number"
      }
      case "object": {
        const members = Object.entries(schemaObject.properties)
          .sort(([a], [b]) => a < b ? -1 : 1)
          .map(([name, definition]) => {
            const isRequired = schemaObject.required.some(it => it === name)

            if (isRef(definition)) {
              this.add(definition)

              return [
                `"${name}"`,
                isRequired ? "" : "?",
                ":",
                getNameFromRef(definition, "t_"),
                ";",
              ].filter(Boolean).join(" ")
            }

            const isReadonly = definition.readOnly
            const isNullable = definition.nullable
            const type = this.schemaObjectToType(definition)

            return [
              isReadonly ? "readonly" : "",
              `"${name}"`,
              isRequired ? "" : "?",
              ":",
              type,
              isNullable && definition.type !== "string" ? "| null" : "",
              ";",
            ].filter(Boolean).join(" ")
          })

        // TODO better support
        const additionalProperties = schemaObject.additionalProperties || members.length === 0 ?
          "[key: string]: unknown;" : ""

        return [
          "{",
          ...members,
          additionalProperties,
          "}",
          // TODO: this gives a ugly but harmless double `null` on the type in some cases
          schemaObject.nullable ? "| null" : "",
        ].filter(Boolean).join("\n")
      }
      default: {
        throw new Error(`unsupported type '${JSON.stringify(schemaObject, undefined, 2)}'`)
      }
    }
  }

  static fromInput(filename: string, input: Input): TypeBuilder {
    return new TypeBuilder(filename, input)
  }
}
