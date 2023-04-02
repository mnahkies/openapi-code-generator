import {describe, it, expect} from "@jest/globals"
import {JoiBuilder} from "./joi-schema-builder"
import {ImportBuilder} from "../../common/import-builder"

describe("joi-schema-builder", () => {
  const builder = new JoiBuilder("joi", "schemas.ts", {
    schema(it: unknown) {
      return it
    },
  } as any, new ImportBuilder())

  describe("for a string", () => {

    it("handles an optional value", () => {
      const actual = builder
        .fromModel({type: "string", nullable: true, readOnly: false}, false)

      const expected = "joi.string()"
      expect(actual).toBe(expected)
    })

    it("handles a required value", () => {
      const actual = builder
        .fromModel({type: "string", nullable: true, readOnly: false}, true)

      const expected = "joi.string().required()"
      expect(actual).toBe(expected)
    })
  })

  describe("for a number", () => {

    it("handles an optional value", () => {
      const actual = builder
        .fromModel({type: "number", nullable: true, readOnly: false}, false)

      const expected = "joi.number()"
      expect(actual).toBe(expected)
    })

    it("handles a required value", () => {
      const actual = builder
        .fromModel({type: "number", nullable: true, readOnly: false}, true)

      const expected = "joi.number().required()"
      expect(actual).toBe(expected)
    })

  })

})
