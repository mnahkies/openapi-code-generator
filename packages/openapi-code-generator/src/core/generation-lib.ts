import { OpenapiDocument, Schema } from "./openapi-types"

export class VirtualDefinition {
  constructor(readonly key: string) {
  }

  readonly definition: OpenapiDocument = {
    openapi: "3.0.3",
    servers: [],
    info: {
      title: `Code Generation Utilities (${ this.key })`,
      description: "Definitions internal to code generation",
      version: "0.0.1",
      contact: { email: "" },
    },
    tags: [],
    paths: {},
    components: {
      parameters: {},
      schemas: {},
    },
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
    this.addSchema('UnknownObject', {
      type: "object",
    })
  }

  readonly UnknownObject$Ref = `${ this.key }#/components/schemas/UnknownObject`
}

export const generationLib = new GenerationLib()
