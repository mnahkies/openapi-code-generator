import {describe, expect} from "@jest/globals"
import {OpenapiValidator} from "./openapi-validator"

describe("core/openapi-validator", () => {
  describe("openapi 3.0", () => {
    it("should accept a valid specification", async () => {
      const validator = await OpenapiValidator.create()
      await expect(
        validator.validate(
          "valid-spec.yaml",
          {
            openapi: "3.0.0",
            info: {
              title: "Valid Specification",
              version: "1.0.0",
            },
            paths: {
              "/something": {
                get: {
                  responses: {default: {description: "whatever"}},
                },
              },
            },
          },
          true,
        ),
      ).resolves.toBeUndefined()
    })

    it("should reject an invalid specification", async () => {
      const validator = await OpenapiValidator.create()
      await expect(
        validator.validate(
          "invalid-spec.yaml",
          {
            openapi: "3.0.0",
            info: {
              title: "Valid Specification",
              version: "1.0.0",
            },
            paths: {
              "/something": {
                get: {
                  responses: {},
                },
              },
            },
          },
          true,
        ),
      ).rejects.toThrow(
        "Validation failed: -> must NOT have fewer than 1 properties at path '/paths/~1something/get/responses'",
      )
    })
  })
})
