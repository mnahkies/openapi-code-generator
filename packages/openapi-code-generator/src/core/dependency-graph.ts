import type {ISchemaProvider} from "./input"
import {logger} from "./logger"
import type {Reference} from "./openapi-types"
import type {MaybeIRModel} from "./openapi-types-normalized"
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
  schema: MaybeIRModel,
  getNameForRef: (ref: Reference) => string,
  visited = new Set<MaybeIRModel>(),
): Set<string> => {
  if (visited.has(schema)) {
    logger.error(
      "circular dependency visited for schema - stopping graph walk",
      {schema},
    )
    return new Set(
      visited
        .values()
        .filter((it) => isRef(it))
        .map(getNameForRef),
    )
  }

  visited.add(schema)

  const result = new Set<string>()

  if (isRef(schema)) {
    result.add(getNameForRef(schema))
  } else {
    if (schema.type === "object") {
      for (const property of Object.values(schema.properties)) {
        intersect(
          result,
          getDependenciesFromSchema(property, getNameForRef, visited),
        )
      }

      if (schema.additionalProperties) {
        intersect(
          result,
          getDependenciesFromSchema(
            schema.additionalProperties,
            getNameForRef,
            visited,
          ),
        )
      }
    } else if (schema.type === "array") {
      intersect(
        result,
        getDependenciesFromSchema(schema.items, getNameForRef, visited),
      )
    } else if (schema.type === "record") {
      intersect(
        result,
        getDependenciesFromSchema(schema.key, getNameForRef, visited),
      )
      intersect(
        result,
        getDependenciesFromSchema(schema.value, getNameForRef, visited),
      )
    } else if (schema.type === "intersection" || schema.type === "union") {
      for (const subSchema of schema.schemas) {
        intersect(
          result,
          getDependenciesFromSchema(subSchema, getNameForRef, visited),
        )
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
 * @param schemaProvider
 * @param getNameForRef
 */
export function buildDependencyGraph(
  schemaProvider: ISchemaProvider,
  getNameForRef: (reference: Reference) => string,
): DependencyGraph {
  logger.time("calculate schema dependency graph")

  /**
   * Create an object mapping name -> Set(direct dependencies)
   */
  const remaining = new Map<string, Set<string>>()
  const order: string[] = []

  // TODO: this may miss extracted in-line schemas
  for (const [name, schema] of Object.entries(schemaProvider.allSchemas())) {
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
