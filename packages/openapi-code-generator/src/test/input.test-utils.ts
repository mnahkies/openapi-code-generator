import path from "path"
import {jest} from "@jest/globals"
import yaml from "js-yaml"
import {Input} from "../core/input"
import {OpenapiLoader} from "../core/openapi-loader"
import {OpenapiValidator} from "../core/openapi-validator"

type Version = "3.0.x" | "3.1.x"

export const testVersions = ["3.0.x", "3.1.x"] satisfies Version[]

function fileForVersion(version: Version) {
  switch (version) {
    case "3.0.x":
      return path.join(__dirname, "unit-test-inputs-3.0.3.yaml")
    case "3.1.x":
      return path.join(__dirname, "unit-test-inputs-3.1.0.yaml")
    default:
      throw new Error(`unsupported test version '${version}'`)
  }
}

export async function unitTestInput(version: Version, skipValidation = false) {
  const validator = await OpenapiValidator.create()

  if (skipValidation) {
    jest.spyOn(validator, "validate").mockResolvedValue()
  }

  const file = fileForVersion(version)
  const loader = await OpenapiLoader.create(file, validator)

  return {input: new Input(loader, {extractInlineSchemas: true}), file}
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

  const loader = await OpenapiLoader.createFromLiteral(spec, validator)

  return new Input(loader, {extractInlineSchemas: true})
}
