import {logger} from "./logger"

import type {ErrorObject} from "ajv"

import validate3_0 = require("./schemas/openapi-3.0-specification-validator")
import validate3_1 = require("./schemas/openapi-3.1-specification-validator")

interface ValidateFunction {
  (data: unknown): boolean

  errors?: null | ErrorObject[]
}

export class OpenapiValidator {
  private constructor(
    private readonly validate3_1: ValidateFunction,
    private readonly validate3_0: ValidateFunction,
    private readonly onValidationFailed: (filename: string) => Promise<void>,
  ) {}

  private validationFunction(version: string): ValidateFunction {
    if (version.startsWith("3.0")) {
      logger.info("Validating against 3.0")
      return this.validate3_0
    }
    if (version.startsWith("3.1")) {
      logger.info("Validating against 3.1")
      return this.validate3_1
    }

    throw new Error(`unsupported openapi version '${version}'`)
  }

  async validate(
    filename: string,
    schema: unknown,
    strict = false,
  ): Promise<void> {
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

      const messages =
        validate.errors?.map((err) => {
          return [
            `-> ${err.message} at path '${err.instancePath}'`,
            err.params,
          ] as const
        }) ?? []

      if (strict) {
        throw new Error(
          `Validation failed: ${messages
            .map((it) => `${it[0]} (${JSON.stringify(it[1])})`)
            .join("\n")}`,
        )
      }
      for (const [message, metadata] of messages) {
        logger.warn(message, metadata)
      }

      logger.warn("")
      await this.onValidationFailed(filename)
    }
  }

  static async create(
    onValidationFailed: (filename: string) => Promise<void> = async () => {},
  ): Promise<OpenapiValidator> {
    const skipValidationLoadSpecificationError: ValidateFunction = () => {
      return true
    }

    try {
      return new OpenapiValidator(validate3_1, validate3_0, onValidationFailed)
    } catch (err) {
      logger.warn(
        "Skipping validation as failed to load schema specification",
        {err},
      )
      return new OpenapiValidator(
        skipValidationLoadSpecificationError,
        skipValidationLoadSpecificationError,
        onValidationFailed,
      )
    }
  }
}
