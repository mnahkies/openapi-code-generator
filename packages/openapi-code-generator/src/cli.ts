#!/usr/bin/env node

import "source-map-support/register"

import path from "node:path"
import {
  Command,
  InvalidArgumentError,
  Option,
} from "@commander-js/extra-typings"
import {promptContinue} from "./core/cli-utils"
import {NodeFsAdaptor} from "./core/file-system/node-fs-adaptor"
import {OperationGroupStrategy} from "./core/input"
import {loadTsConfigCompilerOptions} from "./core/loaders/tsconfig.loader"
import {TypespecLoader} from "./core/loaders/typespec.loader"
import {logger} from "./core/logger"
import {OpenapiValidator} from "./core/openapi-validator"
import {generate} from "./index"
import {templates} from "./templates"
import {TypescriptFormatterBiome} from "./typescript/common/typescript-formatter.biome"

const boolParser = (arg: string): boolean => {
  const TRUTHY_VALUES = ["true", "1", "on"]
  const FALSY_VALUES = ["false", "0", "off", ""]

  if (TRUTHY_VALUES.includes(arg.toLowerCase())) {
    return true
  } else if (FALSY_VALUES.includes(arg.toLowerCase())) {
    return false
  }

  throw new InvalidArgumentError(
    `'${arg}' is not a valid boolean parameter. Valid truthy values are: ${TRUTHY_VALUES.map(
      (it) => JSON.stringify(it),
    ).join(", ")}; falsy values are: ${FALSY_VALUES.map((it) =>
      JSON.stringify(it),
    ).join(", ")}`,
  )
}

const program = new Command()
  .addOption(
    new Option("-i --input <value>", "input file to generate from")
      .env("OPENAPI_INPUT")
      .makeOptionMandatory(),
  )
  .addOption(
    new Option(
      "--input-type <value>",
      "type of input file. this can be openapi3 or typespec",
    )
      .env("OPENAPI_INPUT_TYPE")
      .choices(["openapi3", "typespec"] as const)
      .default("openapi3" as const)
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
      "--ts-allow-any [bool]",
      "(typescript) whether to use `any` or `unknown` for unspecified types",
    )
      .env("OPENAPI_TS_ALLOW_ANY")
      .argParser(boolParser)
      .default(false),
  )
  .addOption(
    new Option(
      "--enable-runtime-response-validation [bool]",
      "(experimental) whether to validate response bodies using the chosen runtime schema library",
    )
      .env("OPENAPI_ENABLE_RUNTIME_RESPONSE_VALIDATION")
      .argParser(boolParser)
      .default(false),
  )
  .addOption(
    new Option(
      "--extract-inline-schemas [bool]",
      "(experimental) Generate names and extract types/schemas for inline schemas",
    )
      .env("OPENAPI_EXTRACT_INLINE_SCHEMAS")
      .argParser(boolParser)
      .default(false),
  )
  .addOption(
    new Option(
      "--allow-unused-imports [bool]",
      "Keep unused imports. Especially useful if there is a bug in the unused-import elimination.",
    )
      .env("OPENAPI_ALLOW_UNUSED_IMPORTS")
      .argParser(boolParser)
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
  const fsAdaptor = new NodeFsAdaptor()
  // TODO: make switchable with prettier / auto-detect from project?
  const formatter = await TypescriptFormatterBiome.createNodeFormatter()
  const validator = await OpenapiValidator.create(async (filename: string) => {
    await promptContinue(
      `Found errors validating '${filename}', continue?`,
      "yes",
    )
  })

  const typespecLoader = await TypespecLoader.create(
    async (filename: string) => {
      await promptContinue(
        `Found diagnostic messages from the typespec compiler for '${filename}', continue?`,
        "yes",
      )
    },
  )

  const compilerOptions = await loadTsConfigCompilerOptions(
    path.join(process.cwd(), config.output),
    fsAdaptor,
  )

  await generate(
    {
      ...config,
      tsCompilerOptions: compilerOptions,
    },
    fsAdaptor,
    formatter,
    validator,
    typespecLoader,
  )
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
