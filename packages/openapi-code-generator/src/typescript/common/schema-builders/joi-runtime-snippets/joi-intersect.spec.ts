import {describe, expect, it} from "@jest/globals"
import joi from "joi"
import {joiIntersect} from "./joi-intersect"

describe("typescript/common/schema-builders/joi-runtime-snippets/joi-intersect", () => {
  const A = joi
    .object()
    .keys({a: joi.string().required()})
    .options({stripUnknown: true})

  const B = joi
    .object()
    .keys({b: joi.string().required()})
    .options({stripUnknown: true})

  const C = joi
    .object()
    .keys({c: joi.string().required()})
    .options({stripUnknown: true})

  const D = joi
    .object()
    .keys({d: joi.string().required()})
    .options({stripUnknown: true})

  describe("match one unions", () => {
    const BCUnion = joi.alternatives().match("one").try(B, C)

    it("can validate A & (B | C)", () => {
      const intersection = joiIntersect(A, BCUnion)

      // A & B
      expect(intersection.validate({a: "a", b: "b"}).error).toBeUndefined()
      // A & C
      expect(intersection.validate({a: "a", c: "c"}).error).toBeUndefined()
      // Fails A
      expect(intersection.validate({b: "b"}).error).toBeDefined()
      // missing both B and C
      expect(intersection.validate({a: "a"}).error).toBeDefined()
      // both B and C present
      expect(
        intersection.validate({a: "a", b: "b", c: "c"}).error,
      ).toBeDefined()
    })

    it("can validate (A & (B | C)) & D", () => {
      const Intersect = joiIntersect(joiIntersect(A, BCUnion), D)

      // A & B & D
      expect(Intersect.validate({a: "a", b: "b", d: "d"}).error).toBeUndefined()
      // A & C & D
      expect(Intersect.validate({a: "a", c: "c", d: "d"}).error).toBeUndefined()
      // Missing D
      expect(Intersect.validate({a: "a", b: "b"}).error).toBeDefined()
    })
  })

  describe("match any unions", () => {
    const BCUnion = joi.alternatives().match("any").try(B, C)

    it("can validate A & (B | C)", () => {
      const intersection = joiIntersect(A, BCUnion)

      // A & B
      expect(intersection.validate({a: "a", b: "b"}).error).toBeUndefined()
      // A & C
      expect(intersection.validate({a: "a", c: "c"}).error).toBeUndefined()
      // missing A
      expect(intersection.validate({b: "b"}).error).toBeDefined()
      // missing both B and C
      expect(intersection.validate({a: "a"}).error).toBeDefined()
      // picks first match
      expect(
        intersection.validate({a: "a", b: "b", c: "c"}).error,
      ).toBeUndefined()
    })

    it("can validate (A & (B | C)) & D", () => {
      const intersection = joiIntersect(joiIntersect(A, BCUnion), D)

      // A & B & D
      expect(
        intersection.validate({a: "a", b: "b", d: "d"}).error,
      ).toBeUndefined()
      // A & C & D
      expect(
        intersection.validate({a: "a", c: "c", d: "d"}).error,
      ).toBeUndefined()
      // Missing A
      expect(intersection.validate({b: "b", d: "d"}).error).toBeDefined()
      // Missing D
      expect(intersection.validate({a: "a", b: "b"}).error).toBeDefined()
      // Missing B & C
      expect(intersection.validate({a: "a", d: "d"}).error).toBeDefined()
    })
  })

  it("throws when intersecting non-object schemas", () => {
    expect(() => joiIntersect(joi.string(), joi.object())).toThrow(
      "only objects, or unions of objects can be intersected together.",
    )
  })

  it("throws when intersecting function schemas", () => {
    const functionSchema = joi.function()

    expect(() => joiIntersect(functionSchema, joi.object())).toThrow(
      "only objects, or unions of objects can be intersected together.",
    )
  })
})
