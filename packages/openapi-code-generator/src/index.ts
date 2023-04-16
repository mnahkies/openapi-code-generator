import {logger} from "./core/logger"

logger.time("program starting")

import "source-map-support/register"

import {OpenapiLoader} from "./core/openapi-loader"
import {Input} from "./core/input"
import {OpenapiValidator} from "./core/openapi-validator"
import {config} from "./config"

async function main() {
  logger.info(`running on input file '${config.input}'`)

  logger.time("load files")

  const validator = await OpenapiValidator.create()

  const loader = await OpenapiLoader.create(config.input, validator)

  const input = new Input(loader)

  logger.time("generation")
  // TODO abort generation if not a git repo or there are uncommitted changes
  await config.generator({
    input,
    dest: config.output,
    schemaBuilder: config.schemaBuilder,
  })
}

main()
  .then(() => {
    logger.info("generation complete!")
    logger.info("elapsed", logger.toJSON())

    process.exit(0)
  })
  .catch((err) => {
    logger.error("unhandled error", err)

    process.exit(1)
  })
