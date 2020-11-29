import Ajv, { ValidateFunction } from 'ajv'
import { promptContinue } from "./cli-utils"
import openapi3Specification = require('./openapi-3-specification.json')
import { logger } from "./logger"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsonSchemaDraft04 = require('ajv/lib/refs/json-schema-draft-04.json')

export class OpenapiValidator {

  private readonly validationFunction: ValidateFunction

  private constructor() {
    const ajv = new Ajv({ schemaId: 'auto' })
    ajv.addMetaSchema(jsonSchemaDraft04)
    this.validationFunction = ajv.compile(openapi3Specification)
  }

  async validate(filename: string, schema: unknown): Promise<void> {
    const isValid = this.validationFunction(schema)

    if (!isValid) {
      logger.warn(`Found errors validating '${ filename }'.`)
      logger.warn(`Note errors may cascade, and should be investigated top to bottom. Errors:\n`)

      this.validationFunction.errors?.forEach(err => {
        logger.warn(`-> ${ err.message } at path '${ err.dataPath }'`, err.params)
      })

      logger.warn("")

      await promptContinue(`Found errors validating '${ filename }', continue?`, "yes")
    }
  }

  static async create(): Promise<OpenapiValidator> {
    return new OpenapiValidator()
  }
}
