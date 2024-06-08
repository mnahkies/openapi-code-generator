import type {OpenapiDocument, Schema} from "./openapi-types"

export class VirtualDefinition {
  readonly definition: OpenapiDocument

  constructor(readonly key: string) {
    this.definition = {
      openapi: "3.0.3",
      servers: [],
      info: {
        title: `Code Generation Utilities (${key})`,
        description: "Definitions internal to code generation",
        version: "0.0.1",
        contact: {email: ""},
      },
      tags: [],
      paths: {},
      components: {
        parameters: {},
        schemas: {},
        "x-transformations": {},
      },
    }
  }

  addSchema(name: string, definition: Schema): void {
    if (this.definition.components?.schemas) {
      this.definition.components.schemas[name] = definition
    }
  }
}

export class GenerationLib extends VirtualDefinition {
  constructor() {
    super("generation.yaml")
    this.addSchema("UnknownObject", {
      type: "object",
    })

    const transformations = this.definition.components?.["x-transformations"]

    if (transformations) {
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      transformations["ScalarOrArrayToArray"] = {
        fn: `<T>(it: T|T[]) =>
          Array.isArray(it) || it === undefined ? it : [it]`,
      }
    }
  }

  readonly UnknownObject$Ref = `${this.key}#/components/schemas/UnknownObject`
  readonly ScalarOrArrayToArrayTransformation$Ref =
    `${this.key}#/components/x-transformations/ScalarOrArrayToArray`
}

export const generationLib = new GenerationLib()
