import Ajv2020, {ValidateFunction} from "ajv/dist/2020"
import addFormats from "ajv-formats"
import {promptContinue} from "./cli-utils"
import openapi3Specification = require("./openapi-3-specification.json")
import {logger} from "./logger"

export class OpenapiValidator {

  private readonly validationFunction: ValidateFunction

  private constructor() {
    const ajv = new Ajv2020({strict: false})
    addFormats(ajv)
    ajv.addFormat("media-range", true)
    this.validationFunction = ajv.compile(openapi3Specification)
  }

  async validate(filename: string, schema: unknown): Promise<void> {
    const isValid = this.validationFunction(schema)

    if (!isValid) {
      logger.warn(`Found errors validating '${filename}'.`)
      logger.warn("Note errors may cascade, and should be investigated top to bottom. Errors:\n")

      this.validationFunction.errors?.forEach(err => {
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
