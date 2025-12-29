import joi from "joi"

/**
 * Recursively re-distribute the type union/intersection such that joi can support it
 * Eg: from A & (B | C) to (A & B) | (A & C)
 * https://github.com/hapijs/joi/issues/3057
 */
export function joiIntersect(
  left: joi.Schema,
  right: joi.Schema,
): joi.ObjectSchema | joi.AlternativesSchema {
  if (isAlternativesSchema(left)) {
    return joi
      .alternatives()
      .match(left.$_getFlag("match") ?? "any")
      .try(...getAlternatives(left).map((it) => joiIntersect(it, right)))
  }

  if (isAlternativesSchema(right)) {
    return joi
      .alternatives()
      .match(right.$_getFlag("match") ?? "any")
      .try(...getAlternatives(right).map((it) => joiIntersect(left, it)))
  }

  if (!isObjectSchema(left) || !isObjectSchema(right)) {
    throw new Error(
      "only objects, or unions of objects can be intersected together.",
    )
  }

  return (left as joi.ObjectSchema).concat(right)

  function isAlternativesSchema(it: joi.Schema): it is joi.AlternativesSchema {
    return it.type === "alternatives"
  }

  function isObjectSchema(it: joi.Schema): it is joi.ObjectSchema {
    return it.type === "object"
  }

  function getAlternatives(it: joi.AlternativesSchema): joi.Schema[] {
    const terms = it.$_terms
    const matches = terms.matches

    if (!Array.isArray(matches)) {
      throw new Error("$_terms.matches is not an array of schemas")
    }

    return matches.map((it) => it.schema)
  }
}

// hack: exports the above as a string for inclusion in generated output.
export const joiIntersectRawSrc = `
/**
 * Recursively re-distribute the type union/intersection such that joi can support it
 * Eg: from A & (B | C) to (A & B) | (A & C)
 * https://github.com/hapijs/joi/issues/3057
 */
export function joiIntersect(
  left: joi.Schema,
  right: joi.Schema,
): joi.ObjectSchema | joi.AlternativesSchema {
  if (isAlternativesSchema(left)) {
    return joi
      .alternatives()
      .match(left.$_getFlag("match") ?? "any")
      .try(...getAlternatives(left).map((it) => joiIntersect(it, right)))
  }

  if (isAlternativesSchema(right)) {
    return joi
      .alternatives()
      .match(right.$_getFlag("match") ?? "any")
      .try(...getAlternatives(right).map((it) => joiIntersect(left, it)))
  }

  if (!isObjectSchema(left) || !isObjectSchema(right)) {
    throw new Error("only objects, or unions of objects can be intersected together.")
  }

  return (left as joi.ObjectSchema).concat(right)

  function isAlternativesSchema(it: joi.Schema): it is joi.AlternativesSchema {
    return it.type === "alternatives"
  }

  function isObjectSchema(it: joi.Schema): it is joi.ObjectSchema {
    return it.type === "object"
  }

  function getAlternatives(it: joi.AlternativesSchema): joi.Schema[] {
    const terms = it.$_terms
    const matches = terms.matches

    if (!Array.isArray(matches)) {
      throw new Error("$_terms.matches is not an array of schemas")
    }

    return matches.map((it) => it.schema)
  }
}
`
