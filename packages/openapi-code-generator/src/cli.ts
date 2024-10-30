#!/usr/bin/env node

import "source-map-support/register"

import path from "node:path"
import {
  Command,
  InvalidArgumentError,
  Option,
} from "@commander-js/extra-typings"
import {z} from "zod"
import {promptContinue} from "./core/cli-utils"
import {NodeFsAdaptor} from "./core/file-system/node-fs-adaptor"
import type {OperationGroupStrategy} from "./core/input"
import {loadTsConfigCompilerOptions} from "./core/loaders/tsconfig.loader"
import {TypespecLoader} from "./core/loaders/typespec.loader"
import {logger} from "./core/logger"
import {OpenapiValidator} from "./core/openapi-validator"
import type {IdentifierConvention} from "./core/utils"
import {generate} from "./index"
import type {templates} from "./templates"
import type {ServerImplementationMethod} from "./templates.types"
import {TypescriptFormatterBiome} from "./typescript/common/typescript-formatter.biome"

export const boolParser = (arg: string): boolean => {
  const TRUTHY_VALUES = ["true", "1", "on"]
  const FALSY_VALUES = ["false", "0", "off", ""]

  if (TRUTHY_VALUES.includes(arg.toLowerCase())) {
    return true
  }
  if (FALSY_VALUES.includes(arg.toLowerCase())) {
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

export const remoteSpecRequestHeadersParser = (arg: string) => {
  return z
    .preprocess(
      (str) =>
        z
          .string()
          .transform((it) => JSON.parse(it))
          .parse(str),
      z.record(
        z.string(),
        z.preprocess(
          (it) => (!it || Array.isArray(it) ? it : [it]),
          z.array(
            z.object({
              name: z.string(),
              value: z.string(),
            }),
          ),
        ),
      ),
    )
    .parse(arg)
}

const program = new Command()
  .addOption(
    new Option("-i --input <value>", "input specification to generate from")
      .env("OPENAPI_INPUT")
      .makeOptionMandatory(),
  )
  .addOption(
    new Option("--input-type <value>", "type of input specification")
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
      "--override-specification-title <value>",
      "Override the value of the info.title field, used to generate some symbol names",
    ).env("OPENAPI_OVERRIDE_SPECIFICATION_TITLE"),
  )
  .addOption(
    new Option(
      "-s --schema-builder <value>",
      "(typescript) runtime schema parsing library to use",
    )
      .env("OPENAPI_SCHEMA_BUILDER")
      .choices(["zod", "joi"] as const)
      .default("zod" as const)
      .makeOptionMandatory(),
  )
  .addOption(
    new Option(
      "--ts-allow-any [bool]",
      `(typescript) whether to use "any" or "unknown" for unspecified types`,
    )
      .env("OPENAPI_TS_ALLOW_ANY")
      .argParser(boolParser)
      .default(false),
  )
  .addOption(
    new Option(
      "--ts-server-implementation-method <value>",
      "(experimental) (server templates only) how to define the route implementation types",
    )
      .env("OPENAPI_TS_SERVER_IMPLEMENTATION_METHOD")
      .choices([
        "interface",
        "type",
        "abstract-class",
      ] as const satisfies ServerImplementationMethod[])
      .default("type" as const satisfies ServerImplementationMethod)
      .makeOptionMandatory(),
  )
  .addOption(
    new Option(
      "--enable-runtime-response-validation [bool]",
      "(experimental) (client sdks only) whether to validate response bodies using the chosen runtime schema library",
    )
      .env("OPENAPI_ENABLE_RUNTIME_RESPONSE_VALIDATION")
      .argParser(boolParser)
      .default(false),
  )
  .addOption(
    new Option(
      "--enable-typed-base-paths",
      "(client sdks only) whether to produce a union type for the client basePath from the `servers` array",
    )
      .env("OPENAPI_ENABLE_TYPED_BASE_PATHS")
      .argParser(boolParser)
      .default(true),
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
      "Keep unused imports. Primarily useful if a bug occurs in the unused-import elimination.",
    )
      .env("OPENAPI_ALLOW_UNUSED_IMPORTS")
      .argParser(boolParser)
      .default(false),
  )
  .addOption(
    new Option(
      "--grouping-strategy <value>",
      `
    (experimental) Strategy to use for splitting output into separate files.

    Set to none for a single generated.ts`,
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
  .addOption(
    new Option(
      "--filename-convention <value>",
      "Convention to use for generated filenames",
    )
      .env("OPENAPI_FILENAME_CONVENTION")
      .choices([
        "camel-case",
        "title-case",
        "kebab-case",
        "snake-case",
      ] as const satisfies IdentifierConvention[])
      .default("kebab-case" as const)
      .makeOptionMandatory(),
  )
  .addOption(
    new Option(
      "--remote-spec-request-headers <value>",
      `
    Request headers to use when fetching remote specifications.

    Format is a JSON object keyed by domain name/uri, with values {name, value}[].
    Eg: '{"https://example.com": [{"name": "Authorization", "value": "some arbitrary value"}]}'.

    Use this if you're generating from a uri that requires authentication.

    A full match on the provided domain/uri is required for the headers to be sent.
    Eg: given a uri of "https://exmaple.com:8080/openapi.yaml" the headers would not
    be sent for requests to other ports, resource paths, or protocols, but a less specific
    uri like "https://example.com" will send headers on any request to that domain.

    Using the environment variable variant is recommended to keep secrets out of your shell history`,
    )
      .env("OPENAPI_REMOTE_SPEC_REQUEST_HEADERS")
      .argParser(remoteSpecRequestHeadersParser),
  )
  .showHelpAfterError()

async function main() {
  const config = program.parse().opts()

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

if (require.main === module) {
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
}
