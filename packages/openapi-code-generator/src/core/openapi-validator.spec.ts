import {describe, expect, it} from "vitest"
import {OpenapiValidator} from "./openapi-validator.ts"

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
              title: "Invalid Specification",
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

  describe("openapi 3.1", () => {
    it("should accept a valid specification", async () => {
      const validator = await OpenapiValidator.create()
      await expect(
        validator.validate(
          "valid-spec.yaml",
          {
            openapi: "3.1.0",
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
            components: {
              schemas: {
                Something: {
                  type: ["object", "null"],
                  properties: {
                    name: {type: "string"},
                  },
                },
              },
            },
          },
          true,
        ),
      ).resolves.toBeUndefined()
    })

    it("should accept anonymous security alternatives", async () => {
      const validator = await OpenapiValidator.create()
      await expect(
        validator.validate(
          "optional-security.yaml",
          {
            openapi: "3.1.0",
            info: {
              title: "Optional Security",
              version: "1.0.0",
            },
            paths: {
              "/public-or-keyed": {
                get: {
                  security: [{ApiKeyAuth: []}, {}],
                  responses: {default: {description: "ok"}},
                },
              },
            },
            components: {
              securitySchemes: {
                ApiKeyAuth: {
                  type: "apiKey",
                  in: "header",
                  name: "X-API-Key",
                },
              },
            },
          },
          true,
        ),
      ).resolves.toBeUndefined()
    })

    it.skip("should reject an invalid specification", async () => {
      const validator = await OpenapiValidator.create()
      await expect(
        validator.validate(
          "invalid-spec.yaml",
          {
            openapi: "3.1.0",
            info: {
              title: "Invalid Specification",
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
