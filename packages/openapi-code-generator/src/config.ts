import convict from "convict"
import { OpenapiGenerator, templates } from "./templates"

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
})

export class Config {
  get input(): string {
    return convictConfig.get("input")
  }

  get output(): string {
    return convictConfig.get("output")
  }

  get generator(): OpenapiGenerator {
    const template = convictConfig.get("template")

    if (!Reflect.has(templates, template)) {
      throw new Error(`template named '${ template }' is not supported`)
    }

    return templates[template]
  }
}

export const config = new Config()
