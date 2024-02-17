import Ajv2020, {ValidateFunction} from "ajv/dist/2020"
import addFormats from "ajv-formats"
import {promptContinue} from "./cli-utils"
import openapi3_1_specification = require("./schemas/openapi-3.1-specification-base.json")
import openapi3_0_specification = require("./schemas/openapi-3.0-specification.json")
import {logger} from "./logger"
import AjvDraft04 from "ajv-draft-04"

export class OpenapiValidator {
  private constructor(
    private readonly validate3_1: ValidateFunction,
    private readonly validate3_0: ValidateFunction,
  ) {}

  private validationFunction(version: string): ValidateFunction {
    if (version.startsWith("3.0")) {
      logger.info("Validating against 3.0")
      return this.validate3_0
    } else if (version.startsWith("3.1")) {
      logger.info("Validating against 3.1")
      return this.validate3_1
    }

    throw new Error(`unsupported openapi version '${version}'`)
  }

  async validate(filename: string, schema: unknown): Promise<void> {
    const version =
      (schema &&
        typeof schema === "object" &&
        Reflect.get(schema, "openapi")) ||
      "unknown"
    const validate = this.validationFunction(version)

    const isValid = validate(schema)

    if (!isValid) {
      logger.warn(`Found errors validating '${filename}'.`)
      logger.warn(
        "Note errors may cascade, and should be investigated top to bottom. Errors:\n",
      )

      validate.errors?.forEach((err) => {
        logger.warn(
          `-> ${err.message} at path '${err.instancePath}'`,
          err.params,
        )
      })

      logger.warn("")

      await promptContinue(
        `Found errors validating '${filename}', continue?`,
        "yes",
      )
    }
  }

  static async create(): Promise<OpenapiValidator> {
    const loadSchema = async (uri: string): Promise<any> => {
      const res = await fetch(uri)
      return (await res.json()) as any
    }

    const ajv2020 = new Ajv2020({
      strict: false,
      verbose: true,
      loadSchema,
    })
    addFormats(ajv2020)
    ajv2020.addFormat("media-range", true)

    const validate3_1 = await ajv2020.compileAsync(openapi3_1_specification)

    const skipValidation: ValidateFunction = (() => {
      logger.warn(
        "Skipping validation due to https://github.com/mnahkies/openapi-code-generator/issues/103",
      )
      return true
    }) as any

    const ajv4 = new AjvDraft04({
      strict: false,
      loadSchema,
    })
    addFormats(ajv4)

    const validate3_0 = await ajv4.compileAsync(openapi3_0_specification)

    return new OpenapiValidator(skipValidation || validate3_1, validate3_0)
  }
}
