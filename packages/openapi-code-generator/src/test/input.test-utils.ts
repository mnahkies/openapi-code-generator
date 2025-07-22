import path from "node:path"
import {jest} from "@jest/globals"
import yaml from "js-yaml"
import {NodeFsAdaptor} from "../core/file-system/node-fs-adaptor"
import {Input} from "../core/input"
import {GenericLoader} from "../core/loaders/generic.loader"
import {TypespecLoader} from "../core/loaders/typespec.loader"
import {logger} from "../core/logger"
import {OpenapiLoader} from "../core/openapi-loader"
import {OpenapiValidator} from "../core/openapi-validator"

export type OpenApiVersion = "3.0.x" | "3.1.x"

function getTestVersions(): OpenApiVersion[] {
  if (process.argv.find((arg) => ["--updateSnapshot", "-u"].includes(arg))) {
    logger.warn("Running with --updateSnapshot - only testing one version")
    return ["3.0.x"]
  }

  return ["3.0.x"]
}

export const testVersions = getTestVersions()

function fileForVersion(version: OpenApiVersion) {
  switch (version) {
    case "3.0.x":
      return path.join(__dirname, "unit-test-inputs-3.0.3.yaml")
    case "3.1.x":
      return path.join(__dirname, "unit-test-inputs-3.1.0.yaml")
    default:
      throw new Error(`unsupported test version '${version}'`)
  }
}

export async function unitTestInput(
  version: OpenApiVersion,
  skipValidation = false,
) {
  const validator = await OpenapiValidator.create()

  if (skipValidation) {
    jest.spyOn(validator, "validate").mockResolvedValue()
  }

  const file = fileForVersion(version)
  const loader = await OpenapiLoader.create(
    {entryPoint: file, fileType: "openapi3", titleOverride: undefined},
    validator,
    new GenericLoader(new NodeFsAdaptor()),
    await TypespecLoader.create(),
  )

  return {
    input: new Input(loader, {
      extractInlineSchemas: true,
      enumExtensibility: "closed",
    }),
    file,
  }
}

export async function createTestInputFromYamlString(
  str: string,
  skipValidation = true,
): Promise<Input> {
  const spec = yaml.load(str)

  if (typeof spec !== "object" || !spec) {
    throw new Error("failed to load spec from yaml")
  }

  const validator = await OpenapiValidator.create()

  if (skipValidation) {
    jest.spyOn(validator, "validate").mockResolvedValue()
  }

  const loader = await OpenapiLoader.createFromLiteral(
    spec,
    validator,
    new GenericLoader(new NodeFsAdaptor()),
  )

  return new Input(loader, {
    extractInlineSchemas: true,
    enumExtensibility: "closed",
  })
}
