import {Reference} from "./openapi-types"
import {IRModel} from "./openapi-types-normalized"
import {isRef} from "./openapi-utils"
import {Input} from "./input"

type DependencyGraph = { [name: string]: DependencyGraph };

/**
 * Pretty horrible function that works out the order that schemas should be output, based on their dependencies.
 * The result is an ordering that will allow code to reference dependencies without causing uninitialised errors.
 * I'm sure this can be done in a nicer way, but it works ¯\_(ツ)_/¯
 *
 * It's not perfect though:
 * - no attempt to handle cycles (though not sure if that is valid to begin with)
 * - doesn't discover schemas declared in external specifications (eg: shared definition files)
 * @param input
 * @param getNameForRef
 */
export function buildDependencyGraph(
  input: Input,
  getNameForRef: (reference: Reference) => string
) {
  const getDependencies = (schema: IRModel | Reference): DependencyGraph => {
    if (isRef(schema)) {
      return {[getNameForRef(schema)]: getDependencies(input.schema(schema))}
    }

    const composite: Array<IRModel | Reference> = (
      Reflect.get(schema, "oneOf") ?? []
    ).concat(Reflect.get(schema, "allOf") ?? [])

    if (composite.length) {
      return composite.map(getDependencies).reduce((acc, it) => {
        return {...acc, ...it}
      }, {} as DependencyGraph)
    }

    switch (schema.type) {
      case "number":
      case "string":
      case "boolean":
        return {}
      case "array":
        return getDependencies(schema.items)
      case "object":
        return Object.values(schema.properties).reduce((acc, it) => {
          return {...acc, ...getDependencies(it)}
        }, {} as DependencyGraph)
    }
  }

  const dependencyGraph = Object.fromEntries(
    Object.entries(input.allSchemas()).map(([name, schema]) => {
      return [getNameForRef({$ref: `/${name}`}), getDependencies(schema)]
    })
  )

  const levels: string[][] = []

  function addToLevels(i: number, it: string) {
    const level = levels[i] ?? []
    if (!levels[i]) {
      levels[i] = level
    }
    if (!level.includes(it)) {
      level.push(it)
    }
  }

  function buildLevel(obj: Record<string, Record<string, any>>, i: number) {
    Object.entries(obj).forEach(([name, deps]) => {
      addToLevels(i, name)
      buildLevel(deps, i + 1)
    })
  }

  buildLevel(dependencyGraph, 0)

  const sorted = levels.map((it) => it.sort())

  const seen = new Set()

  const result: string[] = []

  sorted.reverse().forEach((names) => {
    names.forEach((it) => {
      if (!seen.has(it)) {
        result.push(it)
        seen.add(it)
      }
    })
  })

  return result
}
