import type {Input} from "./input"
import {logger} from "./logger"
import type {Reference} from "./openapi-types"
import type {IRModel, MaybeIRModel} from "./openapi-types-normalized"
import {isRef} from "./openapi-utils"

function intersect<T>(a: Set<T>, b: Set<T>) {
  for (const it of b) {
    a.add(it)
  }
}

function remove(a: Set<unknown>, b: Set<unknown>) {
  for (const it of b) {
    a.delete(it)
  }
}

const getAllSourcesFromSchema = (it: IRModel) => {
  const allSources: Array<MaybeIRModel> = [it as MaybeIRModel]

  if (it.type === "object") {
    if (it.oneOf.length > 0) {
      allSources.push(...it.oneOf)
    }

    if (it.allOf.length > 0) {
      allSources.push(...it.allOf)
    }

    if (it.anyOf.length > 0) {
      allSources.push(...it.anyOf)
    }

    if (
      it.additionalProperties &&
      typeof it.additionalProperties !== "boolean"
    ) {
      allSources.push(it.additionalProperties)
    }
  } else if (it.type === "array") {
    allSources.push(it.items)
  }

  return allSources
}

const getDependenciesFromSchema = (
  schema: IRModel,
  getNameForRef: (ref: Reference) => string,
): Set<string> => {
  const allSources = getAllSourcesFromSchema(schema)
  const result = new Set<string>()

  for (const it of allSources) {
    if (isRef(it)) {
      result.add(getNameForRef(it))
    } else if (it.type === "object") {
      const innerSources = Object.values(it.properties)

      if (it.oneOf.length > 0) {
        innerSources.push(...it.oneOf)
      }

      if (it.allOf.length > 0) {
        innerSources.push(...it.allOf)
      }

      if (it.anyOf.length > 0) {
        innerSources.push(...it.anyOf)
      }

      for (const prop of innerSources) {
        if (isRef(prop)) {
          result.add(getNameForRef(prop))
        } else if (prop.type === "object") {
          intersect(result, getDependenciesFromSchema(prop, getNameForRef))
        } else if (prop.type === "array") {
          if (isRef(prop.items)) {
            result.add(getNameForRef(prop.items))
          } else {
            intersect(
              result,
              getDependenciesFromSchema(prop.items, getNameForRef),
            )
          }
        }
      }
    }
  }

  return result
}

export type DependencyGraph = {order: string[]; circular: Set<string>}
/**
 * Pretty horrible function that works out the order that schemas should be output, based on their dependencies.
 * The result is an ordering that will allow code to reference dependencies without causing uninitialised errors.
 * I'm sure this can be done in a nicer way, but it works ¯\_(ツ)_/¯
 *
 * It's not perfect though:
 * - doesn't discover schemas declared in external specifications (eg: shared definition files)
 * @param input
 * @param getNameForRef
 */
export function buildDependencyGraph(
  input: Input,
  getNameForRef: (reference: Reference) => string,
): DependencyGraph {
  logger.time("calculate schema dependency graph")

  /**
   * Create an object mapping name -> Set(direct dependencies)
   */
  const remaining = new Map<string, Set<string>>()
  const order: string[] = []

  // TODO: this may miss extracted in-line schemas
  for (const [name, schema] of Object.entries(input.allSchemas())) {
    remaining.set(
      getNameForRef({$ref: name}),
      getDependenciesFromSchema(schema, getNameForRef),
    )
  }

  /**
   * While objects with no dependencies remain,
   * Add the 0 dependency names to the order, and remove these
   * from the dependency set for the other objects - since it has
   * been placed in the order it is no longer a dependency.
   *
   * If we exhaust the objects with 0 dependencies, this means that
   * all the remaining objects reference each other circularly in some
   * way, and therefore can not be ordered correctly at all.
   */
  while (remaining.size > 0) {
    const noDeps = []
    const noDepsSet = new Set()

    const hasDeps: [string, Set<string>][] = []

    for (const [name, deps] of remaining) {
      if (deps.size === 0) {
        noDeps.push(name)
        noDepsSet.add(name)
      } else {
        hasDeps.push([name, deps])
      }
    }

    noDeps.sort()

    order.push(...noDeps)

    if (noDepsSet.size === 0) {
      // remaining dependencies are inter-dependent
      break
    }

    for (const name of noDeps) {
      remaining.delete(name)
    }

    for (const [, deps] of hasDeps) {
      remove(deps, noDepsSet)
    }
  }

  return {order, circular: new Set(remaining.keys())}
}
