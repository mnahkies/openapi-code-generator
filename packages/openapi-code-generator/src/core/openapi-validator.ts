import type {
  Output,
  OutputFormat,
  ValidationOptions,
} from "@hyperjump/json-schema"
import {validate as validate3_0} from "@hyperjump/json-schema/openapi-3-0"
import {validate as validate3_1} from "@hyperjump/json-schema/openapi-3-1"
import {
  jsonSchemaErrors,
  setNormalizationHandler,
} from "@hyperjump/json-schema-errors"
import {logger} from "./logger.ts"
import type {ValidateFunction} from "./schemas/IValidateFunction.ts"

export interface IOpenapiValidator {
  validate(filename: string, schema: unknown, strict?: boolean): Promise<void>
}

export class OpenapiValidator implements IOpenapiValidator {
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

    // todo: openapi 3.2: add validator

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

    const {isValid, errors} = await validate(schema)

    if (!isValid) {
      logger.warn(`Found errors validating '${filename}'.`)
      logger.warn(
        "Note errors may cascade, and should be investigated top to bottom. Errors:\n",
      )

      const messages =
        errors.map((err) => {
          return [
            `-> ${err.message} at path '${err.instanceLocation}'`.replace(
              /[\u202A-\u202E\u2066-\u2069]/g,
              "'",
            ),
            {
              schemaLocations: err.schemaLocations,
              alternatives: err.alternatives,
            },
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
    setNormalizationHandler("https://json-schema.org/keyword/comment", {
      evaluate() {
        // Only applicator keywords need to return a value
      },
    })

    return new OpenapiValidator(
      wrapHyperjump(validate3_1, "https://spec.openapis.org/oas/3.1/schema"),
      wrapHyperjump(validate3_0, "https://spec.openapis.org/oas/3.0/schema"),
      onValidationFailed,
    )
  }
}

function wrapHyperjump(
  validate: (
    url: string,
    // biome-ignore lint/suspicious/noExplicitAny: unknown input
    value: any,
    options?: OutputFormat | ValidationOptions,
  ) => Promise<Output>,
  uri: string,
): ValidateFunction {
  // biome-ignore lint/suspicious/noExplicitAny: unknown input
  return async (it: any) => {
    try {
      const res = await validate(uri, it, "BASIC")

      if (res.valid) {
        return {isValid: true, errors: []}
      }

      const errors = await jsonSchemaErrors(res, uri, it)
      return {isValid: false, errors}
    } catch (err: unknown) {
      return {
        isValid: false,
        errors: [
          {
            message: err instanceof Error ? err.message : String(err),
            alternatives: [],
            schemaLocations: [],
            instanceLocation: "",
          },
        ],
      }
    }
  }
}
