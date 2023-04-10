import Ajv2020, {ValidateFunction} from "ajv/dist/2020"
import addFormats from "ajv-formats"
import {promptContinue} from "./cli-utils"
import openapi3_1_0_specification = require("./schemas/openapi-3.1.0-specification.json")
import openapi3_0_0_specification = require("./schemas/openapi-3.0.0-specification.json")
import {logger} from "./logger"
import AjvDraft04 from "ajv-draft-04"

export class OpenapiValidator {

  private readonly validate3_1_0: ValidateFunction
  private readonly validate3_0_0: ValidateFunction

  private constructor() {
    const ajv2020 = new Ajv2020({strict: false})
    addFormats(ajv2020)
    ajv2020.addFormat("media-range", true)

    this.validate3_1_0 = ajv2020.compile(openapi3_1_0_specification)

    const ajv4 = new AjvDraft04({strict: false})
    addFormats(ajv4)

    this.validate3_0_0 = ajv4.compile(openapi3_0_0_specification)
  }

  private validationFunction(version: string) {
    switch (version) {
      case "3.0.0":
        return this.validate3_0_0
      case "3.1.0":
        return this.validate3_1_0
      default:
        throw new Error("unsupported openapi version")
    }
  }

  async validate(filename: string, schema: unknown): Promise<void> {
    const version = schema && typeof schema === "object" && Reflect.get(schema, "openapi")
    const validate = this.validationFunction(version)

    const isValid = validate(schema)

    if (!isValid) {
      logger.warn(`Found errors validating '${filename}'.`)
      logger.warn("Note errors may cascade, and should be investigated top to bottom. Errors:\n")

      validate.errors?.forEach(err => {
        logger.warn(`-> ${err.message} at path '${err.instancePath}'`, err.params)
      })

      logger.warn("")

      await promptContinue(`Found errors validating '${filename}', continue?`, "yes")
    }
  }

  static async create(): Promise<OpenapiValidator> {
    return new OpenapiValidator()
  }
}
