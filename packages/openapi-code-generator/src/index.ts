#!/usr/bin/env node
/**
 * @prettier
 */

import "source-map-support/register"

import {OpenapiLoader} from "./core/openapi-loader"
import {Input} from "./core/input"
import {OpenapiValidator} from "./core/openapi-validator"
import {Option, Command} from "@commander-js/extra-typings"
import {templates} from "./templates"
import {logger} from "./core/logger"

const program = new Command()
  .addOption(
    new Option("-i --input <value>", "openapi3 schema file to generate from")
      .env("OPENAPI_INPUT")
      .makeOptionMandatory(),
  )
  .addOption(
    new Option("-o --output <value>", "directory to output generated code")
      .env("OPENAPI_OUTPUT")
      .makeOptionMandatory(),
  )
  .addOption(
    new Option("-t --template <value>", "template to use")
      .env("OPENAPI_TEMPLATE")
      .choices([
        "typescript-koa",
        "typescript-fetch",
        "typescript-angular",
      ] as const satisfies Readonly<Array<keyof typeof templates>>)
      .makeOptionMandatory(),
  )
  .addOption(
    new Option(
      "-s --schema-builder <value>",
      "runtime schema parsing library to use",
    )
      .env("OPENAPI_SCHEMA_BUILDER")
      .choices(["zod", "joi"] as const)
      .default("zod" as const)
      .makeOptionMandatory(),
  )
  .parse()

const config = program.opts()

async function main() {
  logger.time("program starting")
  logger.info(`running on input file '${config.input}'`)

  logger.time("load files")

  const validator = await OpenapiValidator.create()

  const loader = await OpenapiLoader.create(config.input, validator)

  const input = new Input(loader)

  const generator = templates[config.template]

  await generator({
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
