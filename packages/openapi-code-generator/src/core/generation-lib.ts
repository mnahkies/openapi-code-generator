import { OpenapiDocument } from "./openapi-types"

export class GenerationLib {
  readonly key = "generation.yaml"
  readonly definition: OpenapiDocument = {
    openapi: "3.0.3",
    servers: [],
    info: {
      title: "Code Generation Utilities",
      description: "Definitions internal to code generation",
      version: "0.0.1",
      contact: { email: "" },
    },
    tags: [],
    paths: {},
    components: {
      parameters: {},
      schemas: {
        UnknownObject: {
          type: "object",
        },
      },
    },

  }
  readonly UnknownObject$Ref = `${ this.key }#/components/schemas/UnknownObject`
}

export const generationLib = new GenerationLib()
