import {OpenapiValidator} from "../core/openapi-validator"
import {jest} from "@jest/globals"
import {OpenapiLoader} from "../core/openapi-loader"
import {Input} from "../core/input"
import path from "path"

export async function unitTestInput(skipValidation = false) {
  const validator = await OpenapiValidator.create()

  if (skipValidation) {
    jest.spyOn(validator, "validate").mockResolvedValue()
  }

  const file = path.join(__dirname, "unit-test-inputs.yaml")
  const loader = await OpenapiLoader.create(file, validator)

  return {input: new Input(loader), file }
}
