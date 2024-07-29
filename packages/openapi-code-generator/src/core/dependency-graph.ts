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

const getDependenciesFromSchema = (
  schema: IRModel,
  getNameForRef: (ref: Reference) => string,
): Set<string> => {
  const allSources: Array<MaybeIRModel> = [schema as MaybeIRModel]
    .concat(Reflect.get(schema, "oneOf") ?? [])
    .concat(Reflect.get(schema, "allOf") ?? [])
    .concat(Reflect.get(schema, "anyOf") ?? [])
    .concat(
      schema.type === "object" &&
        schema.additionalProperties &&
        typeof schema.additionalProperties !== "boolean"
        ? [schema.additionalProperties]
        : [],
    )

  return allSources.reduce((acc, it) => {
    if (isRef(it)) {
      acc.add(getNameForRef(it))
    } else if (it.type === "object") {
      // biome-ignore lint/complexity/noForEach: <explanation>
      Object.values(it.properties)
        .concat(Reflect.get(schema, "oneOf") ?? [])
        .concat(Reflect.get(schema, "allOf") ?? [])
        .concat(Reflect.get(schema, "anyOf") ?? [])
        .forEach((prop) => {
          if (isRef(prop)) {
            acc.add(getNameForRef(prop))
          } else if (prop.type === "object") {
            intersect(acc, getDependenciesFromSchema(prop, getNameForRef))
          } else if (prop.type === "array") {
            if (isRef(prop.items)) {
              acc.add(getNameForRef(prop.items))
            } else {
              intersect(
                acc,
                getDependenciesFromSchema(prop.items, getNameForRef),
              )
            }
          }
        })
    }

    return acc
  }, new Set<string>())
}

function split<T>(
  arr: T[],
  predicate: (it: T) => "left" | "right",
): [T[], T[]] {
  const left: T[] = []
  const right: T[] = []

  // biome-ignore lint/complexity/noForEach: <explanation>
  arr.forEach((it) => {
    switch (predicate(it)) {
      case "left":
        left.push(it)
        break
      case "right":
        right.push(it)
        break
    }
  })

  return [left, right]
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
  const dependencyGraph = Object.fromEntries(
    // TODO: this may miss extracted in-line schemas
    Object.entries(input.allSchemas()).map(([name, schema]) => {
      return [
        getNameForRef({$ref: name}),
        new Set(getDependenciesFromSchema(schema, getNameForRef)),
      ]
    }),
  )

  const order: string[] = []

  let remaining = {...dependencyGraph}

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
  while (Object.keys(remaining).length) {
    const [left, right] = split(Object.entries(remaining), ([, deps]) =>
      deps.size === 0 ? "left" : "right",
    )

    const noDeps = left.map((it) => it[0]).sort()

    const noDepsSet = new Set(noDeps)

    order.push(...noDeps)

    if (noDepsSet.size === 0) {
      // remaining dependencies are inter-dependent
      break
    }

    remaining = Object.fromEntries(right)

    // biome-ignore lint/complexity/noForEach: <explanation>
    right.forEach(([, deps]) => {
      remove(deps, noDepsSet)
    })
  }

  return {order, circular: new Set(Object.keys(remaining))}
}
