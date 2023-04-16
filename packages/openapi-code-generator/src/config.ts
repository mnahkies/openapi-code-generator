import convict from "convict"
import {templates} from "./templates"
import {OpenapiGenerator} from "./templates.types"
import {SchemaBuilderType} from "./typescript/common/schema-builders/schema-builder"

const convictConfig = convict({
  input: {
    doc: "Openapi3 scheme file",
    format: String,
    default: "",
    env: "INPUT",
    arg: "input",
  },
  output: {
    doc: "Output directory",
    format: String,
    default: "",
    env: "OUTPUT",
    arg: "output",
  },
  template: {
    doc: "Template to generate from",
    format: String,
    default: "typescript-fetch",
    env: "TEMPLATE",
    arg: "template",
  },
  schemaBuilder: {
    doc: "Runtime parsing library to use",
    format: ["zod", "joi"],
    default: "zod",
    env: "SCHEMA_BUILDER",
    arg: "schema-builder",
  }
})

export class Config {
  get input(): string {
    return convictConfig.get("input")
  }

  get output(): string {
    return convictConfig.get("output")
  }

  get schemaBuilder(): SchemaBuilderType {
    return convictConfig.get<any>("schemaBuilder")
  }

  get generator(): OpenapiGenerator {
    const template = convictConfig.get("template")

    if (!Reflect.has(templates, template)) {
      throw new Error(`template named '${template}' is not supported`)
    }

    return templates[template]
  }
}

export const config = new Config()
