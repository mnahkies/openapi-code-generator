#!/usr/bin/env node

import "source-map-support/register"

import path from "path"

import {Command, Option} from "@commander-js/extra-typings"
import {loadTsConfigCompilerOptions} from "./core/file-loader"
import {Input, OperationGroupStrategy} from "./core/input"
import {logger} from "./core/logger"
import {OpenapiLoader} from "./core/openapi-loader"
import {OpenapiValidator} from "./core/openapi-validator"
import {templates} from "./templates"

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
        "typescript-axios",
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
  .addOption(
    new Option(
      "--enable-runtime-response-validation",
      "(experimental) whether to validate response bodies using the chosen runtime schema library",
    )
      .env("OPENAPI_ENABLE_RUNTIME_RESPONSE_VALIDATION")
      .default(false),
  )
  .addOption(
    new Option(
      "--extract-inline-schemas",
      "(experimental) Generate names and extract types/schemas for inline schemas",
    )
      .env("OPENAPI_EXTRACT_INLINE_SCHEMAS")
      .default(false),
  )
  .addOption(
    new Option(
      "--allow-unused-imports",
      "Keep unused imports. Especially useful if there is a bug in the unused-import elimination.",
    )
      .env("OPENAPI_ALLOW_UNUSED_IMPORTS")
      .default(false),
  )
  .addOption(
    new Option(
      "--grouping-strategy <value>",
      "(experimental) Strategy to use for splitting output into separate files. Set to none for a single generated.ts",
    )
      .env("OPENAPI_GROUPING_STRATEGY")
      .choices([
        "none",
        "first-tag",
        "first-slug",
      ] as const satisfies OperationGroupStrategy[])
      .default("none" as const)
      .makeOptionMandatory(),
  )
  .showHelpAfterError()
  .parse()

const config = program.opts()

async function main() {
  logger.time("program starting")
  logger.info(`running on input file '${config.input}'`)
  logger.time("load files")
  const compilerOptions = loadTsConfigCompilerOptions(
    path.join(process.cwd(), config.output),
  )
  const validator = await OpenapiValidator.create()

  const loader = await OpenapiLoader.create(config.input, validator)

  const input = new Input(loader, {
    extractInlineSchemas: config.extractInlineSchemas,
  })

  const generator = templates[config.template]

  await generator({
    input,
    dest: config.output,
    schemaBuilder: config.schemaBuilder,
    enableRuntimeResponseValidation: config.enableRuntimeResponseValidation,
    compilerOptions,
    allowUnusedImports: config.allowUnusedImports,
    groupingStrategy: config.groupingStrategy,
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
